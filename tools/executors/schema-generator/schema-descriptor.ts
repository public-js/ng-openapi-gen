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
        verbose: {
            description: 'Whether to output additional information during generation or not.',
            type: 'boolean',
            default: false,
            alias: 'v',
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
        configurationFile: {
            description: 'Name for the configuration file to generate.',
            type: 'string',
            default: 'api-configuration',
        },
        rootUrlToken: {
            description: 'Name for the "root URL" DI token to generate.',
            type: 'string',
            default: 'API_ROOT_URL_TOKEN',
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
            description: [
                'Determines how root enums will be generated. Possible values are:',
                '- `alias` for a type alias with the possible values;',
                '- `upper` for an enum with UPPER_CASE names;',
                '- `pascal` for an enum with PascalCase names.',
                '',
            ].join('\n'),
            type: 'enum',
            default: 'pascal',
            values: ['alias', 'upper', 'pascal'],
        },
        // operationPathVisibility: {
        //     description: 'Determines visibility of "operation path" class properties.',
        //     type: 'enum',
        //     default: 'private',
        //     values: ['public', 'protected', 'private'],
        // },
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
        fallbackPropertyType: {
            description: 'Fallback property type when type can not be determined for any reason.',
            type: 'string',
            default: 'any',
        },
        lineSeparator: {
            description:
                'When specified, overrides default system line separators when writing files. Possible values are: `\\n` and `\\r\\n`.',
            type: 'enum',
            values: ['\\n', '\\r\\n'],
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
        // validationRules: {
        //     description: 'Defines custom validation rules for spec file.',
        //     type: 'object',
        //     properties: {
        //         operationTags$gte: {
        //             description: 'Ensure that each operation has tags count >= value',
        //             type: 'object',
        //             properties: {
        //                 value: { type: 'number', requiredIn: ['json', 'model'] },
        //                 level: { type: 'enum', values: ['error', 'warn'], requiredIn: ['json', 'model'] },
        //             },
        //         },
        //         operationId$required: {
        //             description: 'Ensure that each operation has operationId',
        //             type: 'object',
        //             properties: {
        //                 level: { type: 'enum', values: ['error', 'warn'], requiredIn: ['json', 'model'] },
        //             },
        //         },
        //         requestBodyContent$required: {
        //             description: 'Ensure that each requestBody present is a valid object',
        //             type: 'object',
        //             properties: {
        //                 level: { type: 'enum', values: ['error', 'warn'], requiredIn: ['json', 'model'] },
        //             },
        //         },
        //         requestBodyContent$lte: {
        //             description: 'Ensure that each requestBody present has media types count <= value',
        //             type: 'object',
        //             properties: {
        //                 value: { type: 'number', requiredIn: ['json', 'model'] },
        //                 level: { type: 'enum', values: ['error', 'warn'], requiredIn: ['json', 'model'] },
        //             },
        //         },
        //         responseContent$lte: {
        //             description: 'Ensure that each response present has media types count <= value',
        //             type: 'object',
        //             properties: {
        //                 value: { type: 'number', requiredIn: ['json', 'model'] },
        //                 level: { type: 'enum', values: ['error', 'warn'], requiredIn: ['json', 'model'] },
        //             },
        //         },
        //     },
        // },
        responseMethodDescription: {
            description: 'Description template for generated $response method.',
            type: 'string',
            default: [
                '{{descriptionPrefix}}This method provides access to the full `HttpResponse`, allowing access to response headers.',
                'To access only the response body, use `{{methodName}}()` instead.{{descriptionSuffix}}',
            ].join('\n'),
            onlyFor: ['json', 'model'],
        },
        bodyMethodDescription: {
            description: 'Description template for generated $body method.',
            type: 'string',
            default: [
                '{{descriptionPrefix}}This method provides access only to the response body.',
                'To access the full response (for headers, for example), use `{{responseMethodName}}()` instead.{{descriptionSuffix}}',
            ].join('\n'),
            onlyFor: ['json', 'model'],
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
        hooks: {
            type: 'fnObject',
            default: {},
            onlyFor: ['model'],
            properties: {
                generate$pre: { type: 'fn' },
                collectTemplates$post: { type: 'fn' },
                collectModels$post: { type: 'fn' },
                collectOperations$post: { type: 'fn' },
                collectServices$post: { type: 'fn' },
                generation$post: { type: 'fn' },
            },
        },
    },
};
