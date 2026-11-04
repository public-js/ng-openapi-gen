import jsesc from 'jsesc';
import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import type { Options } from '../../config/options.js';
import { effectiveSchemaOrRef, qualifiedName, resolveRef } from '../../utils/open-api.js';
import { refName, tsComments } from '../../utils/string.js';
import type { OaImport } from '../models/oa-import.js';
import type { OaModel } from '../models/oa-model.js';

export interface TypeContext {
    openApi: OpenAPIObject;
    options: Options;
    imports?: Map<string, OaImport>;
    /** The model being rendered, so that references to itself use its own type name */
    container?: OaModel;
}

/** Returns the TypeScript type for the given schema */
export function tsTypeVal(schemaOrRef: SchemaObject | ReferenceObject | undefined, context: TypeContext): string {
    const { options } = context;
    const effective = effectiveSchemaOrRef(schemaOrRef);
    if (!effective) {
        return options.fallbackPropertyType;
    }
    if (effective.$ref) {
        return referenceType(effective.$ref, context);
    }

    const schema = effective as SchemaObject;
    const union = schema.oneOf || schema.anyOf || [];
    if (union.length > 0) {
        const types = union.map((member) => tsTypeVal(member, context));
        return types.length > 1 ? `(${types.join(' | ')})` : types[0];
    }

    const type = schema.type || options.fallbackPropertyType;
    if (type === 'array' || schema.items) {
        return arrayType(schema, context);
    }

    const allOf = schema.allOf || [];
    const enumMember = enumMemberType(allOf, context);
    if (enumMember) {
        return enumMember;
    }

    const intersection = allOf.map((member) => tsTypeVal(member, context));
    if (type === 'object' || schema.properties) {
        intersection.push(objectType(schema, context));
    }
    if (intersection.length > 0) {
        return intersection.join(' & ');
    }

    const enumValues = schema.enum || [];
    if (enumValues.length > 0) {
        return type === 'number' || type === 'integer' || type === 'boolean'
            ? enumValues.join(' | ')
            : enumValues.map((value) => `'${jsesc(value)}'`).join(' | ');
    }

    if (type === 'string' && schema.format === 'binary') {
        return 'Blob';
    }
    if (type === 'integer') {
        return schema.format === 'int64' && options.bigintStyle === 'bigint' ? 'bigint' : 'number';
    }
    return type;
}

function referenceType(ref: string, { openApi, options, imports, container }: TypeContext): string {
    const prefix = (resolveRef(openApi, ref) as SchemaObject).nullable ? 'null | ' : '';
    const name = refName(ref);
    if (container?.name === name) {
        return prefix + container.typeName;
    }
    const imp = imports?.get(name);
    return prefix + (imp ? importedName(imp) : qualifiedName(name, options));
}

function importedName(imp: OaImport): string {
    return imp.useAlias ? imp.qualifiedName : imp.typeName;
}

function arrayType(schema: SchemaObject, context: TypeContext): string {
    const items = schema.items || {};
    let itemsType = tsTypeVal(items, context);
    if ((items as SchemaObject).nullable && !itemsType.includes(' | null')) {
        itemsType += ' | null';
    }
    return `Array<${itemsType}>`;
}

/** Special case: an `allOf` of an enum reference and a single allowed value renders as that enum member */
function enumMemberType(allOf: Array<SchemaObject | ReferenceObject>, { imports }: TypeContext): string | undefined {
    if (allOf.length !== 2) {
        return undefined;
    }
    const enumRef = allOf.find((member) => !!member.$ref) as ReferenceObject | undefined;
    const member = allOf.find((candidate) => !!(candidate as SchemaObject).enum) as SchemaObject | undefined;
    if (!enumRef || member?.enum?.length !== 1) {
        return undefined;
    }

    const imp = imports?.get(refName(enumRef.$ref));
    if (!imp?.modelPtr?.isEnum) {
        return undefined;
    }
    const value = typeof member.enum[0] === 'string' ? `'${member.enum[0]}'` : member.enum[0];
    const enumValue = imp.modelPtr.enumValues.find((candidate) => candidate.value === value);
    return enumValue && `${importedName(imp)}.${enumValue.name}`;
}

function objectType(schema: SchemaObject, context: TypeContext): string {
    const properties = schema.properties || {};
    const discriminatorLines = (schema.allOf || [])
        .map((baseSchema) => discriminator(baseSchema, schema, context.openApi))
        .filter((entry) => entry !== undefined)
        .map(({ propName, value }) => `'${propName}': '${value}';\n`);
    const additionalProperties = schema.additionalProperties === true ? {} : schema.additionalProperties;

    if (additionalProperties && discriminatorLines.length === 0 && Object.keys(properties).length === 0) {
        return `{ [key: string]: ${tsTypeVal(additionalProperties, context)}; }`;
    }

    let result = `{\n${discriminatorLines.join('')}`;
    for (const [propName, property] of Object.entries(properties)) {
        if (!property) {
            continue;
        }
        const { description, deprecated, nullable } = property as SchemaObject;
        if (description) {
            result += tsComments(description, 0, deprecated);
        }
        const optional = schema.required?.includes(propName) ? '' : '?';
        result += `'${propName}'${optional}: ${tsTypeVal(property, context)}${nullable ? ' | null' : ''};\n`;
    }
    if (additionalProperties) {
        result += `[key: string]: ${tsTypeVal(additionalProperties, context)};\n`;
    }
    return `${result}}`;
}

/** Tries to get the discriminator property and value that a base schema defines for a derived one */
function discriminator(
    baseSchemaOrRef: SchemaObject | ReferenceObject,
    derivedSchema: SchemaObject,
    openApi: OpenAPIObject,
): { propName: string; value: string } | undefined {
    const baseSchema = (
        baseSchemaOrRef.$ref ? resolveRef(openApi, baseSchemaOrRef.$ref) : baseSchemaOrRef
    ) as SchemaObject;
    const { propertyName: propName, mapping } = baseSchema.discriminator ?? {};
    if (!propName || !mapping) {
        return undefined;
    }
    const entry = Object.entries(mapping).find(([, ref]) => resolveRef(openApi, ref) === derivedSchema);
    return entry?.[0] ? { propName, value: entry[0] } : undefined;
}
