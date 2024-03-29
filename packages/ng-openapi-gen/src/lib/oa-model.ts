import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

import { OaBase } from './oa-base.js';
import { OaEnumValue } from './oa-enum-value.js';
import { OaImport } from './oa-import.js';
import { OaProperty } from './oa-property.js';
import { Options } from './options.js';
import { tsTypeVal, unqualifiedName } from './utils/open-api.js';
import { tsComments } from './utils/string.js';

const nullInUnion = { val: 'null | ', len: 7 };

export class OaModel extends OaBase {
    public assumedName: string;

    // General type
    public isSimple: boolean;
    public isEnum: boolean;
    public isObject: boolean;
    // Simple properties
    public simpleType: string;
    public enumValues: OaEnumValue[];
    // Object properties
    public properties: OaProperty[];
    public additionalPropertiesType: string;

    constructor(
        private readonly openApi: OpenAPIObject,
        public readonly schema: SchemaObject,
        refName: string,
        public readonly options: Options,
    ) {
        super(refName, options, unqualifiedName);
        this.assumedName = this.qualifiedName;

        const description = schema.description || '';
        this.tsComments = tsComments(description, 0, schema.deprecated);
        this.pathToModels = '';
    }

    public collectImports(imports: Map<string, OaImport>): void {
        this.createImports(this.schema, imports);
        this.updateImports();
        this.updateProperties(this._imports);
    }

    protected updateProperties(imports: Map<string, OaImport>): void {
        const type = this.schema.type || this.options.fallbackPropertyType;

        // When enumStyle is 'alias' it is handled as a simple type.
        if (
            this.options.enumStyle !== 'alias' &&
            (this.schema.enum || []).length > 0 &&
            ['string', 'number', 'integer'].includes(type)
        ) {
            const names = (this.schema['x-enumNames'] as string[]) || [];
            const descriptions = (this.schema['x-enumDescriptions'] as string[]) || [];
            const values = this.schema.enum || [];
            this.enumValues = [];
            for (const [i, value] of values.entries()) {
                const enumValue = new OaEnumValue(type, this.options, names[i], descriptions[i], value);
                this.enumValues.push(enumValue);
            }
        }

        const hasAllOf = this.schema.allOf && this.schema.allOf.length > 0;
        const hasOneOf = this.schema.oneOf && this.schema.oneOf.length > 0;
        this.isObject =
            (type === 'object' || !!this.schema.properties) && !this.schema.nullable && !hasAllOf && !hasOneOf;
        this.isEnum = (this.enumValues || []).length > 0;
        this.isSimple = !this.isObject && !this.isEnum;

        if (this.isObject) {
            // Object
            const propertiesByName = new Map<string, OaProperty>();
            this.collectObject(this.schema, propertiesByName, imports);
            const sortedNames = [...propertiesByName.keys()];
            sortedNames.sort();
            this.properties = sortedNames.map((propName) => propertiesByName.get(propName) as OaProperty);
        } else {
            // Simple / array / enum / union / intersection
            this.simpleType = tsTypeVal(this.schema, this.openApi, this.options, imports);
        }
    }

    private collectObject(
        schema: SchemaObject,
        propertiesByName: Map<string, OaProperty>,
        imports: Map<string, OaImport>,
    ) {
        if (schema.type === 'object' || !!schema.properties) {
            // An object definition
            const properties = schema.properties || {};
            const required = schema.required || [];
            // When there are additional properties, we need a union of all types for it.
            // See https://github.com/cyclosproject/ng-openapi-gen/issues/68
            const propTypes = new Set<string>();
            const appendType = (type: string) => {
                if (type.startsWith(nullInUnion.val)) {
                    propTypes.add('null');
                    propTypes.add(type.slice(nullInUnion.len));
                } else {
                    propTypes.add(type);
                }
            };
            for (const [propName, propDef] of Object.entries(properties)) {
                const prop = new OaProperty(
                    this,
                    propName,
                    propDef,
                    required.includes(propName),
                    this.openApi,
                    this.options,
                    imports,
                );
                propertiesByName.set(propName, prop);
                appendType(prop.type);
                if (!prop.required) {
                    propTypes.add('undefined');
                }
            }
            if (schema.additionalProperties === true) {
                this.additionalPropertiesType = this.options.fallbackPropertyType;
            } else if (schema.additionalProperties) {
                const propType = tsTypeVal(schema.additionalProperties, this.openApi, this.options, imports);
                appendType(propType);
                this.additionalPropertiesType = [...propTypes].sort().join(' | ');
            }
        }
        if (schema.allOf) {
            for (const s of schema.allOf) {
                this.collectObject(s, propertiesByName, imports);
            }
        }
    }

    protected skipImport(refName: string): boolean {
        return this.refName === refName; // Prevent self imports
    }
}
