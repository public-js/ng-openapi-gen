import jsesc from 'jsesc';
import { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaModel } from '../oa-model.js';
import { Options } from '../options.js';
import { camelCase, upperCase, upperFirst } from './lo/index.js';
import { fileName, namespace, simpleName, toBasicChars, tsComments, typeName } from './string.js';

/**
 * Returns the unqualified model class name, that is, the last part after '.'
 */
export function unqualifiedName(name: string, options: Options): string {
    return modelClass(name.slice(name.lastIndexOf('.') + 1), options);
}

/**
 * Returns the qualified model class name, that is, the camelized namespace (if any) plus the unqualified name
 */
export function qualifiedName(name: string, options: Options): string {
    const ns = namespace(name);
    const unq = unqualifiedName(name, options);
    return ns ? typeName(ns) + unq : unq;
}

/**
 * Returns the name of the enum constant for a given value
 */
export function enumName(value: string, options: Options): string {
    let name = toBasicChars(value, true);
    name = options.enumStyle === 'upper' ? upperCase(name).replace(/\s+/g, '_') : upperFirst(camelCase(name));
    if (/^\d/.test(name)) {
        name = '$' + name;
    }
    return name;
}

/**
 * Returns the file to import for a given model
 */
export function modelFile(pathToModels: string, name: string, options: Options): string {
    let dir = pathToModels || '';
    if (dir.endsWith('/')) {
        dir = dir.slice(0, -1);
    }
    const ns = namespace(name);
    if (ns) {
        dir += `/${ns}`;
    }
    const file = unqualifiedName(name, options);
    return dir + '/' + fileName(file);
}

/**
 * Applies the prefix and suffix to a model class name
 */
export function modelClass(baseName: string, options: Options): string {
    return `${options.modelPrefix}${typeName(baseName)}${options.modelSuffix}`;
}

/**
 * Applies the prefix and suffix to a service class name
 */
export function serviceClass(baseName: string, options: Options): string {
    return `${options.servicePrefix}${typeName(baseName)}${options.serviceSuffix}`;
}

/**
 * Returns the TypeScript type for the given type and options
 */
export function tsType(
    schemaOrRef: SchemaObject | ReferenceObject | undefined,
    options: Options,
    openApi: OpenAPIObject,
    container?: OaModel,
): string {
    if (!schemaOrRef) {
        // No schema
        return options._defaultPropType;
    }
    if (schemaOrRef.$ref) {
        // A reference
        const resolved = resolveRef(openApi, schemaOrRef.$ref);
        const nullable = !!(resolved && (resolved as SchemaObject).nullable);
        const prefix = nullable ? 'null | ' : '';
        const name = simpleName(schemaOrRef.$ref);
        return container && container.name === name
            ? prefix + container.typeName
            : prefix + qualifiedName(name, options);
    }
    const schema = schemaOrRef as SchemaObject;

    // A union of types
    const union = schema.oneOf || schema.anyOf || [];
    if (union.length > 0) {
        return union.length > 1
            ? `(${union.map((u) => tsType(u, options, openApi, container)).join(' | ')})`
            : union.map((u) => tsType(u, options, openApi, container)).join(' | ');
    }

    const type = schema.type || options._defaultPropType;

    // An array
    if (type === 'array' || schema.items) {
        return `Array<${tsType(schema.items || {}, options, openApi, container)}>`;
    }

    // All the types
    const allOf = schema.allOf || [];
    let intersectionType: string[] = [];
    if (allOf.length > 0) {
        intersectionType = allOf.map((u) => tsType(u, options, openApi, container));
    }

    // An object
    if (type === 'object' || schema.properties) {
        let result = '{\n';
        const properties = schema.properties || {};
        const required = schema.required;
        for (const propName of Object.keys(properties)) {
            const property = properties[propName];
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
            let propertyType = tsType(property, options, openApi, container);
            if ((property as SchemaObject).nullable) {
                propertyType = `${propertyType} | null`;
            }
            result += `: ${propertyType};\n`;
        }
        if (schema.additionalProperties) {
            const additionalProperties = schema.additionalProperties === true ? {} : schema.additionalProperties;
            result += `[key: string]: ${tsType(additionalProperties, options, openApi, container)};\n`;
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

    // A simple type
    return type === 'integer' ? 'number' : type;
}

/**
 * Resolves a reference
 * The reference name, such as #/components/schemas/Name, or just Name
 */
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
