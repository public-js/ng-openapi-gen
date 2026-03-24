type PrimitiveKind = 'string' | 'number' | 'boolean';

type OptionKind = PrimitiveKind | 'stringArray' | 'stringOrBoolean' | 'enum' | 'stringArrayOrString' | 'object';

export interface OptionMetadata {
    description: string;
    kind: OptionKind;
    alias?: string;
    default?: unknown;
    enumValues?: string[];
    schema?: Record<string, unknown>;
    cli?: boolean;
}

export const optionMetadata: Record<string, OptionMetadata> = {
    input: {
        description: 'Path to local or URL to remote OpenAPI 3 spec file in JSON or YAML format.',
        kind: 'string',
        alias: 'i',
        cli: true,
    },
    output: {
        description: "Path to directory where the generated files will be written to. Defaults to 'src/app/api'.",
        kind: 'string',
        default: 'src/app/api',
        alias: 'o',
        cli: true,
    },
    verbose: {
        description: 'Whether to output additional information during generation or not. Defaults to false.',
        kind: 'boolean',
        default: false,
        alias: 'v',
        cli: true,
    },
    defaultTag: {
        description: "Tag name assumed for operations without tags. Defaults to 'Api'.",
        kind: 'string',
        default: 'Api',
    },
    fetchTimeout: {
        description: 'Timeout for fetching spec file from remote URL, in milliseconds. Defaults to 20000.',
        kind: 'number',
        default: 20_000,
    },
    includeTags: {
        description: 'Specific tags to be included. Overrides `excludeTags`. Defaults to [].',
        kind: 'stringArray',
        default: [],
    },
    excludeTags: {
        description: 'Specific tags to be excluded. Defaults to [].',
        kind: 'stringArray',
        default: [],
    },
    ignoreUnusedModels: {
        description: 'Whether to skip models with no references to them. Defaults to true.',
        kind: 'boolean',
        default: true,
    },
    removeStaleFiles: {
        description: 'Whether to remove redundant files in the output directory. Defaults to true.',
        kind: 'boolean',
        default: true,
        cli: true,
    },
    modelIndex: {
        description:
            "TypeScript file name (without the `.ts` extension) that exports all models. Set `false` to skip. Defaults to 'models'.",
        kind: 'stringOrBoolean',
        default: 'models',
    },
    serviceIndex: {
        description:
            "TypeScript file name (without the `.ts` extension) that exports all services. Set `false` to skip. Defaults to 'services'.",
        kind: 'stringOrBoolean',
        default: 'services',
    },
    indexFile: {
        description: 'Whether to generate an `index.ts` file that exports all generated files. Defaults to false.',
        kind: 'boolean',
        default: false,
    },
    servicePrefix: {
        description: "Prefix for generated service classes. Defaults to ''.",
        kind: 'string',
        default: '',
    },
    serviceSuffix: {
        description: "Suffix for generated service classes. Defaults to 'Service'.",
        kind: 'string',
        default: 'Service',
    },
    modelPrefix: {
        description: "Prefix for generated model classes. Defaults to ''.",
        kind: 'string',
        default: '',
    },
    modelSuffix: {
        description: "Suffix for generated model classes. Defaults to ''.",
        kind: 'string',
        default: '',
    },
    module: {
        description: "Name for the module class that provides all services. Set `false` to skip. Defaults to 'ApiModule'.",
        kind: 'stringOrBoolean',
        default: 'ApiModule',
    },
    configurationFile: {
        description: "Name for the configuration file to generate. Defaults to 'api-configuration'.",
        kind: 'string',
        default: 'api-configuration',
    },
    rootUrlToken: {
        description: 'Name for the "root URL" DI token to generate. Defaults to \'API_ROOT_URL_TOKEN\'.',
        kind: 'string',
        default: 'API_ROOT_URL_TOKEN',
    },
    requestBuilder: {
        description: "Name for the request builder class to generate. Defaults to 'RequestBuilder'.",
        kind: 'string',
        default: 'RequestBuilder',
    },
    response: {
        description: "Name for the response class to generate. Defaults to 'StrictHttpResponse'.",
        kind: 'string',
        default: 'StrictHttpResponse',
    },
    enumStyle: {
        description:
            "Determines how root enums will be generated. Possible values are:\n- `alias` for type aliases with the possible values;\n- `upper` for enums with UPPER_CASE names;\n- `ignorecase` for enums with names as is;\n- `pascal` for enums with PascalCase names (default).\nDefaults to 'pascal'.",
        kind: 'enum',
        enumValues: ['alias', 'upper', 'ignorecase', 'pascal'],
        default: 'pascal',
    },
    injectionStyle: {
        description:
            "Determines how Angular dependencies are injected in generated services and modules. Can be either `constructor` (default) or `inject`.",
        kind: 'enum',
        enumValues: ['constructor', 'inject'],
        default: 'constructor',
    },
    hooks: {
        description:
            'Path or paths to hook modules. Each module should export a default hook or an array of hooks.',
        kind: 'stringArrayOrString',
        cli: true,
    },
    excludeParameters: {
        description:
            'When specified, filters the generated services, excluding any param corresponding to this list of params.',
        kind: 'stringArray',
    },
    skipJsonSuffix: {
        description: 'When specified, does not generate a $Json suffix. Defaults to false.',
        kind: 'boolean',
        default: false,
    },
    fallbackPropertyType: {
        description: "Fallback property type when type can not be determined for any reason. Defaults to 'any'.",
        kind: 'string',
        default: 'any',
    },
    bigintStyle: {
        description: "Determines how bigint will be generated. Can be either `number` (default) or `bigint`. Defaults to 'number'.",
        kind: 'enum',
        enumValues: ['number', 'bigint'],
        default: 'number',
    },
    endOfLineStyle: {
        description:
            "Determines how to normalize line endings. Possible values are:\n- `lf` to force LF (\\n) line endings (Unix, OS X);\n- `cr` to force CR (\\r) line endings (Mac OS);\n- `crlf` to force CRLF (\\r\\n) line endings (Windows, DOS);\n- `auto` to normalize line endings for the current operating system (default).\nDefaults to 'auto'.",
        kind: 'enum',
        enumValues: ['lf', 'cr', 'crlf', 'auto'],
        default: 'auto',
    },
    runEslint: {
        description: 'Whether to run `eslint --fix` on the generated output directory after writing files. Defaults to true.',
        kind: 'boolean',
        default: true,
    },
    runPrettier: {
        description: 'Whether to run `prettier --write` on the generated output directory after writing files. Defaults to true.',
        kind: 'boolean',
        default: true,
    },
    generateResponseMethod: {
        description: 'Whether to generate the extra `$Response` method by default for each operation. Defaults to true.',
        kind: 'boolean',
        default: true,
    },
};

export const internalDefaultOptions = {
    modelsDir: 'models',
    servicesDir: 'services',
} as const;
