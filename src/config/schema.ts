import { optionMetadata, type OptionMetadata } from './option-metadata.js';

function schemaForOption(_name: string, metadata: OptionMetadata) {
    const description = metadata.description;
    if (metadata.schema) {
        return { description, ...metadata.schema };
    }
    switch (metadata.kind) {
        case 'string':
            return metadata.default !== undefined ? { description, type: 'string', default: metadata.default } : { description, type: 'string' };
        case 'number':
            return metadata.default !== undefined ? { description, type: 'number', default: metadata.default } : { description, type: 'number' };
        case 'boolean':
            return metadata.default !== undefined ? { description, type: 'boolean', default: metadata.default } : { description, type: 'boolean' };
        case 'stringArray':
            return {
                description,
                type: 'array',
                items: { type: 'string' },
                ...(metadata.default !== undefined ? { default: metadata.default } : {}),
            };
        case 'stringOrBoolean':
            return {
                description,
                anyOf: [{ type: 'string' }, { type: 'boolean' }],
                ...(metadata.default !== undefined ? { default: metadata.default } : {}),
            };
        case 'stringArrayOrString':
            return {
                description,
                anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
            };
        case 'enum':
            return {
                description,
                enum: metadata.enumValues,
                ...(metadata.default !== undefined ? { default: metadata.default } : {}),
            };
        case 'object':
            return { description, type: 'object' };
    }
}

export function buildSchemaJson(repository: string) {
    const properties = Object.fromEntries(
        Object.entries(optionMetadata)
            .map(([name, metadata]) => [name, schemaForOption(name, metadata)]),
    );

    return {
        $schema: 'http://json-schema.org/draft-07/schema',
        $id: `${repository}/blob/main/src/schema.json`,
        title: 'Options for ng-openapi-gen',
        type: 'object',
        required: ['input'],
        properties,
    };
}
