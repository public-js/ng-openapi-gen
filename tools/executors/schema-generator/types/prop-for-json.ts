import { JSONSchema7, JSONSchema7Type } from 'json-schema';

import { Property } from './property.js';

export class PropForJson {
    public defaultValueForSchema: JSONSchema7Type;
    public defaultValueForDescription: unknown;
    public description: string;

    constructor(public name: string, public prop: Property) {
        this.defaultValueForSchema = this.getDefaultValueForSchema();
        this.defaultValueForDescription = this.getDefaultValueForDescription();
        this.description = this.getDescription();
    }

    public getSchema(): JSONSchema7 {
        const propSchema: JSONSchema7 = {};
        if (this.description) {
            propSchema.description = this.description;
        }
        this.addTypeDef(propSchema);
        if (this.defaultValueForSchema !== undefined) {
            propSchema.default = this.defaultValueForSchema;
        }
        return propSchema;
    }

    private addTypeDef(propSchema: JSONSchema7) {
        if (this.prop.type === 'array') {
            propSchema.type = this.prop.type;
            propSchema.items = { type: this.prop.arrayOf };
        } else if (this.prop.type === 'enum') {
            propSchema.enum = this.prop.values;
        } else if (Array.isArray(this.prop.type)) {
            propSchema.anyOf = this.prop.type.map((type) => ({ type }));
        } else if (this.prop.type === 'object') {
            propSchema.type = this.prop.type;
            if (this.prop.minProperties !== undefined) {
                propSchema.minProperties = this.prop.minProperties;
            }
            if (this.prop.maxProperties !== undefined) {
                propSchema.maxProperties = this.prop.maxProperties;
            }
            if (this.prop.properties !== undefined) {
                propSchema.properties = {};
                const required: string[] = [];
                for (const [propName, propDesc] of Object.entries(this.prop.properties)) {
                    const propMod = new PropForJson(propName, propDesc);
                    if (propDesc.requiredIn?.includes('json')) {
                        required.push(propName);
                    }
                    propSchema.properties[propName] = propMod.getSchema();
                }
                if (required.length > 0) {
                    propSchema.required = required;
                }
            }
            if (this.prop.patternProperties !== undefined) {
                propSchema.patternProperties = {};
                for (const [patternKey, patternObj] of Object.entries(this.prop.patternProperties)) {
                    const patternProp: JSONSchema7 = { type: 'object' };
                    const required: string[] = [];
                    const properties: Record<string, JSONSchema7> = {};
                    for (const [propName, propDesc] of Object.entries(patternObj.properties)) {
                        const propMod = new PropForJson(propName, propDesc);
                        properties[propName] = propMod.getSchema();
                        if (propDesc.requiredIn?.includes('json')) {
                            required.push(propName);
                        }
                    }
                    if (required.length > 0) {
                        patternProp.required = required;
                    }
                    if (Object.keys(properties).length > 0) {
                        patternProp.properties = properties;
                    }
                    propSchema.patternProperties[patternKey] = patternProp;
                }
            }
        } else if (this.prop.type === 'fnObject') {
            propSchema.type = 'object';
        } else {
            propSchema.type = this.prop.type;
        }
    }

    private getDefaultValueForSchema() {
        if (this.prop.default === undefined || this.prop.type === 'array' || this.prop.type === 'object') {
            return;
        }
        return this.prop.default;
    }

    private getDefaultValueForDescription() {
        if (this.prop.default === undefined) {
            return;
        }
        if (typeof this.prop.default === 'string') {
            return `'${this.prop.default}'`;
        } else if (Array.isArray(this.prop.default)) {
            const innerValue =
                typeof this.prop.default[0] === 'string'
                    ? this.prop.default.map((val) => `'${val}'`)
                    : this.prop.default;
            return `[${innerValue.join(', ')}]`;
        }
        return this.prop.default;
    }

    private getDescription() {
        const origDescription = (this.prop.description || '').trim();
        if (!origDescription) {
            return '';
        }
        const defaultsTo =
            this.defaultValueForDescription === undefined ? '' : `Defaults to ${this.defaultValueForDescription}.`;
        if (!origDescription.includes('\n')) {
            return defaultsTo ? `${origDescription} ${defaultsTo}` : origDescription;
        }
        return defaultsTo ? `${origDescription}\n${defaultsTo}` : origDescription;
    }
}
