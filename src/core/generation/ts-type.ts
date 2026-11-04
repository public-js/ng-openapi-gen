import jsesc from 'jsesc';
import type { OpenAPIObject, ReferenceObject, SchemaObject, SchemaObjectType } from 'openapi3-ts/oas31';

import type { Options } from '../../config/options.js';
import { effectiveSchemaOrRef, isNullable, qualifiedName, resolveRef, schemaTypes } from '../../utils/open-api.js';
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

/** Returns the TypeScript type for the given schema, including `null` when the schema allows it */
export function tsTypeVal(schemaOrRef: SchemaObject | ReferenceObject | undefined, context: TypeContext): string {
    const type = nonNullType(schemaOrRef, context);
    return isNullable(schemaOrRef) && type !== 'null' ? `null | ${type}` : type;
}

/**
 * Returns the TypeScript type for the given schema, leaving out the `null` that {@link isNullable} reports.
 * Models are rendered this way, as references to a nullable model add the `null` themselves.
 */
export function nonNullType(schemaOrRef: SchemaObject | ReferenceObject | undefined, context: TypeContext): string {
    const { options } = context;
    const effective = effectiveSchemaOrRef(schemaOrRef);
    // In OpenAPI 3.1, a schema may also be a boolean
    if (!effective || typeof effective !== 'object') {
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

    const enumValues = literalValues(schema);
    const types = schemaTypes(schema);
    if (types.length > 1 && enumValues.length === 0) {
        const typeList = types.map((type) => tsTypeVal(narrowToType(schema, type), context));
        return `(${typeList.join(' | ')})`;
    }

    const [type = options.fallbackPropertyType] = types;
    if (type === 'array' || schema.items) {
        return arrayType(schema, context);
    }

    const allOf = schema.allOf || [];
    const enumMember = enumMemberType(allOf, context);
    if (enumMember) {
        return enumMember;
    }

    const intersection = allOf.map((member) => nonNullType(member, context));
    if (type === 'object' || schema.properties) {
        intersection.push(objectType(schema, context));
    }
    if (intersection.length > 0) {
        return intersection.join(' & ');
    }

    if (enumValues.length > 0) {
        return enumValues.map(literalType).join(' | ');
    }

    if (type === 'string' && schema.format === 'binary') {
        return 'Blob';
    }
    if (type === 'integer') {
        return schema.format === 'int64' && options.bigintStyle === 'bigint' ? 'bigint' : 'number';
    }
    return type;
}

/** Returns a schema with several types narrowed to one, leaving out the keywords that only apply to the others */
function narrowToType(schema: SchemaObject, type: string): SchemaObject {
    const { properties, additionalProperties, items, ...rest } = schema;
    return {
        ...rest,
        type: type as SchemaObjectType,
        ...(type === 'object' && { properties, additionalProperties }),
        ...(type === 'array' && { items }),
    };
}

/**
 * The values of `enum` or `const`. A `null` value is left out when the schema is nullable, as that's handled apart,
 * unless it's the only value.
 */
function literalValues(schema: SchemaObject): unknown[] {
    const values: unknown[] = schema.enum ?? ('const' in schema ? [schema.const] : []);
    const concreteValues = values.filter((value) => value !== null);
    return isNullable(schema) && concreteValues.length > 0 ? concreteValues : values;
}

/** Returns the TypeScript literal type for a value of `enum` or `const`, which may be any JSON value */
function literalType(value: unknown): string {
    if (typeof value === 'string') {
        return `'${jsesc(value)}'`;
    }
    if (Array.isArray(value)) {
        return `[${value.map(literalType).join(', ')}]`;
    }
    if (typeof value === 'object' && value !== null) {
        const entries = Object.entries(value).map(([key, entry]) => `${quoted(key)}: ${literalType(entry)}`);
        return `{ ${entries.join('; ')} }`;
    }
    return String(value);
}

function quoted(text: string): string {
    return `'${jsesc(text, { minimal: true, quotes: 'single' })}'`;
}

function referenceType(ref: string, { openApi, options, imports, container }: TypeContext): string {
    const prefix = isNullable(resolveRef(openApi, ref) as SchemaObject) ? 'null | ' : '';
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
    let itemsType = nonNullType(items, context);
    if (isNullable(items) && !itemsType.includes(' | null')) {
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
    const value = typeof member.enum[0] === 'string' ? `'${jsesc(member.enum[0])}'` : member.enum[0];
    const enumValue = imp.modelPtr.enumValues.find((candidate) => candidate.value === value);
    return enumValue && `${importedName(imp)}.${enumValue.name}`;
}

function objectType(schema: SchemaObject, context: TypeContext): string {
    const properties = schema.properties || {};
    const discriminatorLines = (schema.allOf || [])
        .map((baseSchema) => discriminator(baseSchema, schema, context.openApi))
        .filter((entry) => entry !== undefined)
        .map(({ propName, value }) => `${quoted(propName)}: ${quoted(value)};\n`);
    const additionalProperties = schema.additionalProperties === true ? {} : schema.additionalProperties;

    if (additionalProperties && discriminatorLines.length === 0 && Object.keys(properties).length === 0) {
        return `{ [key: string]: ${tsTypeVal(additionalProperties, context)}; }`;
    }

    let result = `{\n${discriminatorLines.join('')}`;
    for (const [propName, property] of Object.entries(properties)) {
        if (!property) {
            continue;
        }
        const { description, deprecated } = property as SchemaObject;
        if (description) {
            result += tsComments(description, deprecated);
        }
        const optional = schema.required?.includes(propName) ? '' : '?';
        result += `${quoted(propName)}${optional}: ${nonNullType(property, context)}${isNullable(property) ? ' | null' : ''};\n`;
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
