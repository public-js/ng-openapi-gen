import { Property } from './types/property.js';

export const schemaDescriptor: { properties: Record<string, Property> } = {
    properties: {
        $schema: { type: 'string', onlyFor: ['json'] },
        config: { type: 'string', alias: 'c', onlyFor: ['args'] },
        input: {
            description: 'Path to local or URL to remote OpenAPI 3 spec file in JSON or YAML format.',
            type: 'string',
            alias: 'i',
            requiredIn: ['json', 'model'],
        },
        output: {
            description: 'Path to directory where the generated files will be written to.',
            type: 'string',
            default: 'src/app/api',
            alias: 'o',
        },
        defaultTag: {
            description: 'Tag name assumed for operations without tags.',
            type: 'string',
            default: 'Api',
        },
        fetchTimeout: {
            description: 'Timeout for fetching spec file from remote URL, in milliseconds.',
            type: 'number',
            default: 20_000,
        },
        includeTags: {
            description: 'Specific tags to be included. Overrides "excludeTags".',
            type: 'array',
            arrayOf: 'string',
            default: [],
        },
        excludeTags: {
            description: 'Specific tags to be excluded.',
            type: 'array',
            arrayOf: 'string',
            default: [],
        },
        ignoreUnusedModels: {
            description: 'Whether to skip models with no references to them.',
            type: 'boolean',
            default: true,
        },
        removeStaleFiles: {
            description: 'Whether to remove redundant files in the output directory.',
            type: 'boolean',
            default: true,
        },
        modelIndex: {
            description:
                'TypeScript file name (without the ".ts" extension) that exports all models. Set "false" to skip.',
            type: ['string', 'boolean'],
            default: 'models',
        },
        serviceIndex: {
            description:
                'TypeScript file name (without the ".ts" extension) that exports all services. Set "false" to skip.',
            type: ['string', 'boolean'],
            default: 'services',
        },
        indexFile: {
            description: 'Whether to generate an "index.ts" file that exports all generated files.',
            type: 'boolean',
            default: false,
        },
        servicePrefix: {
            description: 'Prefix for generated service classes.',
            type: 'string',
            default: '',
        },
        serviceSuffix: {
            description: 'Suffix for generated service classes.',
            type: 'string',
            default: 'Service',
        },
        modelPrefix: {
            description: 'Prefix for generated model classes.',
            type: 'string',
            default: '',
        },
        modelSuffix: {
            description: 'Suffix for generated model classes.',
            type: 'string',
            default: '',
        },
        module: {
            description: 'Name for the module class that provides all services. Set "false" to skip.',
            type: ['string', 'boolean'],
            default: 'ApiModule',
        },
        configuration: {
            description: 'Name for the configuration class to generate.',
            type: 'string',
            default: 'ApiConfiguration',
        },
        baseService: {
            description: 'Name for the base service class to generate.',
            type: 'string',
            default: 'BaseService',
        },
        requestBuilder: {
            description: 'Name for the request builder class to generate.',
            type: 'string',
            default: 'RequestBuilder',
        },
        response: {
            description: 'Name for the response class to generate.',
            type: 'string',
            default: 'StrictHttpResponse',
        },
        enumStyle: {
            description: 'Determines how root enums will be generated.',
            type: 'enum',
            default: 'pascal',
            values: ['alias', 'upper', 'pascal'],
        },
        templates: {
            description:
                'Path to directory with custom templates. All `.handlebars` files will override the corresponding default.',
            type: 'string',
        },
        excludeParameters: {
            description:
                'When specified, filters the generated services, excluding any param corresponding to this list of params.',
            type: 'array',
            arrayOf: 'string',
        },
        skipJsonSuffix: {
            description: 'When specified, does not generate a $Json suffix.',
            type: 'boolean',
            default: false,
        },
        customizedResponseType: {
            description:
                "Defines responseType for specific paths to use. Commonly used when built-in deduction can't fulfill your needs.",
            type: 'object',
            minProperties: 1,
            patternProperties: {
                '.*': {
                    type: 'object',
                    properties: {
                        toUse: {
                            type: 'enum',
                            values: ['arraybuffer', 'blob', 'json', 'document'],
                            requiredIn: ['json', 'model'],
                        },
                    },
                },
            },
        },
        fallbackPropertyType: {
            description: 'Fallback property type when type can not be determined for any reason.',
            type: 'string',
            default: 'any',
        },
        modelsDir: {
            type: 'string',
            default: 'models',
            onlyFor: ['model'],
        },
        servicesDir: {
            type: 'string',
            default: 'services',
            onlyFor: ['model'],
        },
    },
};
