import { ReferenceObject, SchemaObject } from 'openapi3-ts';

type ContentSchemaCarrier = SchemaObject & {
    contentMediaType?: string;
    contentSchema?: SchemaObject | ReferenceObject;
};

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

    const schema = schemaOrRef as ContentSchemaCarrier;
    if (schema.type === 'string' && schema.format !== 'binary' && schema.contentSchema) {
        return schema.contentSchema;
    }

    return schemaOrRef;
}
