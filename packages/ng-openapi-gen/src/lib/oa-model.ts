import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

import { OaBase } from './oa-base.js';
import { OaEnumValue } from './oa-enum-value.js';
import { OaProperty } from './oa-property.js';
import { Options } from './options.js';
import { tsType, unqualifiedName } from './utils/open-api.js';
import { tsComments } from './utils/string.js';

const nullInUnion = 'null | ';

export class OaModel extends OaBase {
    // General type
    public isSimple: boolean;
    public isEnum: boolean;
    public isObject: boolean;
    // Simple properties
    public simpleType: string;
    public enumValues: OaEnumValue[];
    // Array properties
    // public elementType: string;
    // Object properties
    public properties: OaProperty[];
    public additionalPropertiesType: string;

    constructor(public openApi: OpenAPIObject, public schema: SchemaObject, name: string, options: Options) {
        super(name, options, unqualifiedName);

        const description = schema.description || '';
        this.tsComments = tsComments(description, 0, schema.deprecated);

        const type = schema.type || options._defaultPropType;

        // When enumStyle is 'alias' it is handled as a simple type.
        if (
            options.enumStyle !== 'alias' &&
            (schema.enum || []).length > 0 &&
            ['string', 'number', 'integer'].includes(type)
        ) {
            const names = (schema['x-enumNames'] as string[]) || [];
            const descriptions = (schema['x-enumDescriptions'] as string[]) || [];
            const values = schema.enum || [];
            this.enumValues = [];
            for (const [i, value] of values.entries()) {
                const enumValue = new OaEnumValue(type, options, names[i], descriptions[i], value);
                this.enumValues.push(enumValue);
            }
        }

        const hasAllOf = schema.allOf && schema.allOf.length > 0;
        this.isObject = (type === 'object' || !!schema.properties) && !schema.nullable && !hasAllOf;
        this.isEnum = (this.enumValues || []).length > 0;
        this.isSimple = !this.isObject && !this.isEnum;

        if (this.isObject) {
            // Object
            const propertiesByName = new Map<string, OaProperty>();
            this.collectObject(schema, propertiesByName);
            const sortedNames = [...propertiesByName.keys()];
            sortedNames.sort();
            this.properties = sortedNames.map((propName) => propertiesByName.get(propName) as OaProperty);
        } else {
            // Simple / array / enum / union / intersection
            this.simpleType = tsType(schema, options, openApi);
        }

        this.collectImports(schema);
        this.updateImports();
    }

    protected pathToModels(): string {
        if (this.namespace) {
            const depth = this.namespace.split('/').length;
            let path = '';
            for (let i = 0; i < depth; i++) {
                path += '../';
            }
            return path;
        }
        return './';
    }

    protected skipImport(name: string): boolean {
        return this.name === name; // Don't import own type
    }

    private collectObject(schema: SchemaObject, propertiesByName: Map<string, OaProperty>) {
        if (schema.type === 'object' || !!schema.properties) {
            // An object definition
            const properties = schema.properties || {};
            const required = schema.required || [];
            const propNames = Object.keys(properties);
            // When there are additional properties, we need a union of all types for it.
            // See https://github.com/cyclosproject/ng-openapi-gen/issues/68
            const propTypes = new Set<string>();
            const appendType = (type: string) => {
                if (type.startsWith(nullInUnion)) {
                    propTypes.add('null');
                    propTypes.add(type.slice(nullInUnion.length));
                } else {
                    propTypes.add(type);
                }
            };
            for (const propName of propNames) {
                const prop = new OaProperty(
                    this,
                    propName,
                    properties[propName],
                    required.includes(propName),
                    this.options,
                    this.openApi,
                );
                propertiesByName.set(propName, prop);
                appendType(prop.type);
                if (!prop.required) {
                    propTypes.add('undefined');
                }
            }
            if (schema.additionalProperties === true) {
                this.additionalPropertiesType = this.options._defaultPropType;
            } else if (schema.additionalProperties) {
                const propType = tsType(schema.additionalProperties, this.options, this.openApi);
                appendType(propType);
                this.additionalPropertiesType = [...propTypes].sort().join(' | ');
            }
        }
        if (schema.allOf) {
            for (const s of schema.allOf) {
                this.collectObject(s, propertiesByName);
            }
        }
    }
}
