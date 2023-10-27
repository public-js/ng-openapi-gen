import jsesc from 'jsesc';
import { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaImport } from '../oa-import.js';
import { OaModel } from '../oa-model.js';
import { Options } from '../options.js';
import { camelCase, upperCase, upperFirst } from './lo/index.js';
import { namespace, refName, toBasicChars, tsComments, typeName } from './string.js';

/** Returns the unqualified model class name, that is, the last part after '.' */
export function unqualifiedName(name: string, options: Options): string {
    const nameParts = name.split('_').map((part) => part.slice(part.lastIndexOf('.') + 1));
    return modelClass(nameParts.join(''), options);
}

/** Returns the qualified model class name, that is, the camelized namespace (if any) plus the unqualified name */
export function qualifiedName(name: string, options: Options): string {
    const ns = namespace(name);
    const unq = unqualifiedName(name, options);
    return ns ? typeName(ns) + unq : unq;
}

/** Returns the name of the enum constant for a given value */
export function enumName(value: string, options: Options): string {
    let name = toBasicChars(value, true);
    if (options.enumStyle === 'ignorecase') {
        return name;
    } else if (options.enumStyle === 'upper') {
        name = upperCase(name).replace(/\s+/g, '_');
    } else {
        name = upperFirst(camelCase(name));
    }
    if (/^\d/.test(name)) {
        name = '$' + name;
    }
    return name;
}

/** Applies the prefix and suffix to a model class name */
export function modelClass(baseName: string, options: Options): string {
    return `${options.modelPrefix}${typeName(baseName)}${options.modelSuffix}`;
}

/** Applies the prefix and suffix to a service class name */
export function serviceClass(baseName: string, options: Options): string {
    return `${options.servicePrefix}${typeName(baseName)}${options.serviceSuffix}`;
}

/** Returns the TypeScript type for the given type and options */
export function tsTypeVal(
    schemaOrRef: SchemaObject | ReferenceObject | undefined,
    openApi: OpenAPIObject,
    options: Options,
    imports?: Map<string, OaImport>,
    container?: OaModel,
): string {
    // No schema
    if (!schemaOrRef) {
        return options.fallbackPropertyType;
    }

    // A reference
    if (schemaOrRef.$ref) {
        const resolved = resolveRef(openApi, schemaOrRef.$ref);
        const nullable = !!(resolved && (resolved as SchemaObject).nullable);
        const prefix = nullable ? 'null | ' : '';
        const name = refName(schemaOrRef.$ref);
        const imp: OaImport | undefined = imports?.get(name);
        return container?.name === name
            ? prefix + container.typeName
            : prefix + (imp ? (imp.useAlias ? imp.qualifiedName : imp.typeName) : qualifiedName(name, options));
    }

    const schema = schemaOrRef as SchemaObject;

    // A union of types
    const union = schema.oneOf || schema.anyOf || [];
    if (union.length > 0) {
        return union.length > 1
            ? `(${union.map((u) => tsTypeVal(u, openApi, options, imports, container)).join(' | ')})`
            : union.map((u) => tsTypeVal(u, openApi, options, imports, container)).join(' | ');
    }

    const type = schema.type || options.fallbackPropertyType;

    // An array
    if (type === 'array' || schema.items) {
        return `Array<${tsTypeVal(schema.items || {}, openApi, options, imports, container)}>`;
    }

    // All the types
    const allOf = schema.allOf || [];
    let intersectionType: string[] = [];
    if (allOf.length > 0) {
        intersectionType = allOf.map((u) => tsTypeVal(u, openApi, options, imports, container));
    }

    // An object
    if (type === 'object' || schema.properties) {
        let result = '{\n';
        const properties = schema.properties || {};
        const required = schema.required;
        for (const [propName, property] of Object.entries(properties)) {
            if (!property) {
                continue;
            }
            if ((property as SchemaObject).description) {
                result += tsComments((property as SchemaObject).description, 0, (property as SchemaObject).deprecated);
            }
            result += `'${propName}'`;
            const propRequired = required && required.includes(propName);
            if (!propRequired) {
                result += '?';
            }
            let propertyType = tsTypeVal(property, openApi, options, imports, container);
            if ((property as SchemaObject).nullable) {
                propertyType = `${propertyType} | null`;
            }
            result += `: ${propertyType};\n`;
        }
        if (schema.additionalProperties) {
            const additionalProperties = schema.additionalProperties === true ? {} : schema.additionalProperties;
            result += `[key: string]: ${tsTypeVal(additionalProperties, openApi, options, imports, container)};\n`;
        }
        result += '}';
        intersectionType.push(result);
    }

    if (intersectionType.length > 0) {
        return intersectionType.join(' & ');
    }

    // Inline enum
    const enumValues = schema.enum || [];
    if (enumValues.length > 0) {
        return type === 'number' || type === 'integer' || type === 'boolean'
            ? enumValues.join(' | ')
            : enumValues.map((v) => `'${jsesc(v)}'`).join(' | ');
    }

    // A Blob
    if (type === 'string' && schema.format === 'binary') {
        return 'Blob';
    }

    // An integer
    if (type === 'integer') {
        return schema.format === 'int64' && options.bigintStyle === 'bigint' ? 'bigint' : 'number';
    }

    // Any other type
    return type;
}

/** Resolves a reference from its name, such as #/components/schemas/Name, or just Name */
export function resolveRef(openApi: OpenAPIObject, ref: string): unknown {
    if (!ref.includes('/')) {
        ref = `#/components/schemas/${ref}`;
    }
    let current: unknown = null;
    for (let part of ref.split('/')) {
        part = part.trim();
        if (part === '#' || part === '') {
            current = openApi;
        } else if (current == null) {
            break;
        } else {
            current = current[part];
        }
    }
    if (current == null || typeof current !== 'object') {
        throw new Error(`Couldn't resolve reference ${ref}`);
    }
    return current;
}
