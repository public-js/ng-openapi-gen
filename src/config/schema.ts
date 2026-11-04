import { optionMetadata, type OptionMetadata } from './option-metadata.js';

function typeSchema(metadata: OptionMetadata) {
    switch (metadata.kind) {
        case 'string':
        case 'number':
        case 'boolean':
            return { type: metadata.kind };
        case 'stringArray':
            return { type: 'array', items: { type: 'string' } };
        case 'stringOrBoolean':
            return { anyOf: [{ type: 'string' }, { type: 'boolean' }] };
        case 'stringArrayOrString':
            return { anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] };
        case 'enum':
            return { enum: metadata.enumValues };
    }
}

function schemaForOption(metadata: OptionMetadata) {
    const defaultValue = metadata.default !== undefined ? { default: metadata.default } : {};
    return { description: metadata.description, ...typeSchema(metadata), ...defaultValue };
}

export function buildSchemaJson(repository: string) {
    const properties = Object.fromEntries(
        Object.entries(optionMetadata).map(([name, metadata]) => [name, schemaForOption(metadata)]),
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
