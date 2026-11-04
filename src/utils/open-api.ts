import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import type { Options } from '../config/options.js';
import { namespace, toBasicChars, typeName } from './string.js';
import { camelCase, upperCase, upperFirst } from './text-case.js';

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
        name = upperCase(name);
    } else {
        name = upperFirst(camelCase(name));
    }
    if (/^\d/.test(name)) {
        name = '$' + name;
    }
    return name;
}

/** Applies the prefix and suffix to a model class name */
function modelClass(baseName: string, options: Options): string {
    return `${options.modelPrefix}${typeName(baseName)}${options.modelSuffix}`;
}

/** Applies the prefix and suffix to a service class name */
export function serviceClass(baseName: string, options: Options): string {
    return `${options.servicePrefix}${typeName(baseName)}${options.serviceSuffix}`;
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
            current = (current as Record<string, unknown>)[part];
        }
    }
    if (current == null || typeof current !== 'object') {
        throw new Error(`Couldn't resolve reference ${ref}`);
    }
    return current;
}

/**
 * JSON Schema `contentSchema` lets specs describe the decoded payload carried inside a string.
 * Prefer the richer type for generated TS types.
 */
export function effectiveSchemaOrRef(
    schemaOrRef: SchemaObject | ReferenceObject | undefined,
): SchemaObject | ReferenceObject | undefined {
    if (!schemaOrRef || schemaOrRef.$ref) {
        return schemaOrRef;
    }
    const schema = schemaOrRef as SchemaObject & { contentSchema?: SchemaObject | ReferenceObject };
    return schema.type === 'string' && schema.format !== 'binary' && schema.contentSchema
        ? schema.contentSchema
        : schemaOrRef;
}
