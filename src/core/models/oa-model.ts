import { posix } from 'node:path';

import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

import { Options } from '../../config/options.js';
import { unqualifiedName } from '../../utils/open-api.js';
import { docText } from '../../utils/string.js';
import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';
import { OaBase } from './oa-base.js';
import { OaEnumValue } from './oa-enum-value.js';
import { OaImport } from './oa-import.js';
import { OaProperty } from './oa-property.js';

const NULL_PREFIX = 'null | ';

export class OaModel extends OaBase {
    public assumedName: string;

    // General type
    public isEnum: boolean;
    public isObject: boolean;
    // Simple properties
    public simpleType = '';
    public enumValues: OaEnumValue[] = [];
    // Object properties
    public properties: OaProperty[] = [];
    public additionalPropertiesType?: string;

    constructor(
        private readonly openApi: OpenAPIObject,
        public readonly schema: SchemaObject,
        refName: string,
        public readonly options: Options,
    ) {
        super(refName, options, unqualifiedName);
        this.assumedName = this.qualifiedName;

        this.docs = docText(schema.description, schema.deprecated);

        const type = this.schema.type || this.options.fallbackPropertyType;

        // When enumStyle is 'alias,' it is handled as a simple type.
        if (
            this.options.enumStyle !== 'alias' &&
            (this.schema.enum || []).length > 0 &&
            ['string', 'number', 'integer'].includes(type)
        ) {
            const names = (this.schema['x-enumNames'] as string[]) || [];
            const descriptions = (this.schema['x-enumDescriptions'] as string[]) || [];
            this.enumValues = (this.schema.enum || []).map(
                (value, i) => new OaEnumValue(type, this.options, names[i], descriptions[i], value),
            );
        }

        const hasAllOf = this.schema.allOf && this.schema.allOf.length > 0;
        const hasOneOf = this.schema.oneOf && this.schema.oneOf.length > 0;
        this.isObject =
            (type === 'object' || !!this.schema.properties) && !this.schema.nullable && !hasAllOf && !hasOneOf;
        this.isEnum = this.enumValues.length > 0;
    }

    public get sourceDir(): string {
        return posix.join(this.options.modelsDir, this.namespace ?? '');
    }

    public get isSimple(): boolean {
        return !this.isObject && !this.isEnum;
    }

    public collectImports(imports: Map<string, OaImport>): void {
        this.createImports(this.schema, imports);
        this.updateImports();
        this.updateProperties(this._imports);
    }

    protected updateProperties(imports: Map<string, OaImport>): void {
        const context: TypeContext = { openApi: this.openApi, options: this.options, imports };
        if (this.isObject) {
            // Object
            const propertiesByName = new Map<string, OaProperty>();
            this.collectObject(this.schema, propertiesByName, context);
            this.properties = [...propertiesByName.keys()].sort().map((propName) => propertiesByName.get(propName)!);
        } else {
            // Simple / array / enum / union / intersection
            this.simpleType = tsTypeVal(this.schema, context);
        }
    }

    private collectObject(schema: SchemaObject, propertiesByName: Map<string, OaProperty>, context: TypeContext) {
        if (schema.type === 'object' || !!schema.properties) {
            // An object definition
            const properties = schema.properties || {};
            const required = schema.required || [];
            // When there are additional properties, we need a union of all types for it.
            // See https://github.com/cyclosproject/ng-openapi-gen/issues/68
            const propTypes = new Set<string>();
            const appendType = (type: string) => {
                if (type.startsWith(NULL_PREFIX)) {
                    propTypes.add('null');
                    propTypes.add(type.slice(NULL_PREFIX.length));
                } else {
                    propTypes.add(type);
                }
            };
            for (const [propName, propDef] of Object.entries(properties)) {
                const prop = new OaProperty(this, propName, propDef, required.includes(propName), context);
                propertiesByName.set(propName, prop);
                appendType(prop.type);
                if (!prop.required) {
                    propTypes.add('undefined');
                }
            }
            if (schema.additionalProperties === true) {
                this.additionalPropertiesType = this.options.fallbackPropertyType;
            } else if (schema.additionalProperties) {
                const propType = tsTypeVal(schema.additionalProperties, context);
                appendType(propType);
                this.additionalPropertiesType = [...propTypes].sort().join(' | ');
            }
        }
        if (schema.allOf) {
            for (const s of schema.allOf) {
                this.collectObject(s, propertiesByName, context);
            }
        }
    }

    protected skipImport(refName: string): boolean {
        return this.refName === refName; // Prevent self-imports
    }
}
