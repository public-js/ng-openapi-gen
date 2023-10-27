interface OptionsInput {
    /** Path to local or URL to remote OpenAPI 3 spec file in JSON or YAML format. */
    input: string;
    /** Path to directory where the generated files will be written to. Defaults to 'src/app/api'. */
    output?: string;
    /** Whether to output additional information during generation or not. Defaults to false. */
    verbose?: boolean;
    /** Tag name assumed for operations without tags. Defaults to 'Api'. */
    defaultTag?: string;
    /** Timeout for fetching spec file from remote URL, in milliseconds. Defaults to 20000. */
    fetchTimeout?: number;
    /** Specific tags to be included. Overrides `excludeTags`. Defaults to []. */
    includeTags?: string[];
    /** Specific tags to be excluded. Defaults to []. */
    excludeTags?: string[];
    /** Whether to skip models with no references to them. Defaults to true. */
    ignoreUnusedModels?: boolean;
    /** Whether to remove redundant files in the output directory. Defaults to true. */
    removeStaleFiles?: boolean;
    /** TypeScript file name (without the `.ts` extension) that exports all models. Set `false` to skip. Defaults to 'models'. */
    modelIndex?: string | boolean;
    /** TypeScript file name (without the `.ts` extension) that exports all services. Set `false` to skip. Defaults to 'services'. */
    serviceIndex?: string | boolean;
    /** Whether to generate an `index.ts` file that exports all generated files. Defaults to false. */
    indexFile?: boolean;
    /** Prefix for generated service classes. Defaults to ''. */
    servicePrefix?: string;
    /** Suffix for generated service classes. Defaults to 'Service'. */
    serviceSuffix?: string;
    /** Prefix for generated model classes. Defaults to ''. */
    modelPrefix?: string;
    /** Suffix for generated model classes. Defaults to ''. */
    modelSuffix?: string;
    /** Name for the module class that provides all services. Set `false` to skip. Defaults to 'ApiModule'. */
    module?: string | boolean;
    /** Name for the configuration file to generate. Defaults to 'api-configuration'. */
    configurationFile?: string;
    /** Name for the "root URL" DI token to generate. Defaults to 'API_ROOT_URL_TOKEN'. */
    rootUrlToken?: string;
    /** Name for the request builder class to generate. Defaults to 'RequestBuilder'. */
    requestBuilder?: string;
    /** Name for the response class to generate. Defaults to 'StrictHttpResponse'. */
    response?: string;
    /**
     * Determines how root enums will be generated. Possible values are:
     * - `alias` for type aliases with the possible values;
     * - `upper` for enums with UPPER_CASE names;
     * - `ignorecase` for enums with names as is;
     * - `pascal` for enums with PascalCase names (default).
     * Defaults to 'pascal'.
     */
    enumStyle?: 'alias' | 'upper' | 'ignorecase' | 'pascal';
    /** Path to directory with custom templates. All `.handlebars` files will override the corresponding default. */
    templates?: string;
    /** When specified, filters the generated services, excluding any param corresponding to this list of params. */
    excludeParameters?: string[];
    /** When specified, does not generate a $Json suffix. Defaults to false. */
    skipJsonSuffix?: boolean;
    /** Fallback property type when type can not be determined for any reason. Defaults to 'any'. */
    fallbackPropertyType?: string;
    /** Determines how bigint will be generated. Can be either `number` (default) or `bigint`. Defaults to 'number'. */
    bigintStyle?: 'number' | 'bigint';
    /**
     * Determines how to normalize line endings. Possible values are:
     * - `lf` to force LF (\n) line endings (Unix, OS X);
     * - `cr` to force CR (\r) line endings (Mac OS);
     * - `crlf` to force CRLF (\r\n) line endings (Windows, DOS);
     * - `auto` to normalize line endings for the current operating system (default).
     * Defaults to 'auto'.
     */
    endOfLineStyle?: 'lf' | 'cr' | 'crlf' | 'auto';
    /** Defines responseType for specific paths to use. Commonly used when built-in deduction can't fulfill your needs. */
    customizedResponseType?: {
        [key: string]: {
            toUse: 'arraybuffer' | 'blob' | 'json' | 'document';
        };
    };
    /** Description template for generated $response method. Defaults to '{{descriptionPrefix}}This method provides access to the full `HttpResponse`, allowing access to response headers.\nTo access only the response body, use `{{methodName}}()` instead.{{descriptionSuffix}}'. */
    responseMethodDescription?: string;
    /** Description template for generated $body method. Defaults to '{{descriptionPrefix}}This method provides access only to the response body.\nTo access the full response (for headers, for example), use `{{responseMethodName}}()` instead.{{descriptionSuffix}}'. */
    bodyMethodDescription?: string;
    modelsDir?: string;
    servicesDir?: string;
    hooks?: {
        generate$pre?: (...params: unknown[]) => void;
        collectTemplates$post?: (...params: unknown[]) => void;
        collectModels$post?: (...params: unknown[]) => void;
        collectOperations$post?: (...params: unknown[]) => void;
        collectServices$post?: (...params: unknown[]) => void;
        generation$post?: (...params: unknown[]) => void;
    };
}

type DefaultedOptions =
    | 'output'
    | 'verbose'
    | 'defaultTag'
    | 'fetchTimeout'
    | 'includeTags'
    | 'excludeTags'
    | 'ignoreUnusedModels'
    | 'removeStaleFiles'
    | 'modelIndex'
    | 'serviceIndex'
    | 'indexFile'
    | 'servicePrefix'
    | 'serviceSuffix'
    | 'modelPrefix'
    | 'modelSuffix'
    | 'module'
    | 'configurationFile'
    | 'rootUrlToken'
    | 'requestBuilder'
    | 'response'
    | 'enumStyle'
    | 'skipJsonSuffix'
    | 'fallbackPropertyType'
    | 'bigintStyle'
    | 'endOfLineStyle'
    | 'responseMethodDescription'
    | 'bodyMethodDescription'
    | 'modelsDir'
    | 'servicesDir'
    | 'hooks';

export type Options = Required<Pick<OptionsInput, DefaultedOptions>> & OptionsInput;

export const defaultOptions: Required<Pick<OptionsInput, DefaultedOptions>> = {
    output: 'src/app/api',
    verbose: false,
    defaultTag: 'Api',
    fetchTimeout: 20_000,
    includeTags: [],
    excludeTags: [],
    ignoreUnusedModels: true,
    removeStaleFiles: true,
    modelIndex: 'models',
    serviceIndex: 'services',
    indexFile: false,
    servicePrefix: '',
    serviceSuffix: 'Service',
    modelPrefix: '',
    modelSuffix: '',
    module: 'ApiModule',
    configurationFile: 'api-configuration',
    rootUrlToken: 'API_ROOT_URL_TOKEN',
    requestBuilder: 'RequestBuilder',
    response: 'StrictHttpResponse',
    enumStyle: 'pascal',
    skipJsonSuffix: false,
    fallbackPropertyType: 'any',
    bigintStyle: 'number',
    endOfLineStyle: 'auto',
    responseMethodDescription:
        '{{descriptionPrefix}}This method provides access to the full `HttpResponse`, allowing access to response headers.\nTo access only the response body, use `{{methodName}}()` instead.{{descriptionSuffix}}',
    bodyMethodDescription:
        '{{descriptionPrefix}}This method provides access only to the response body.\nTo access the full response (for headers, for example), use `{{responseMethodName}}()` instead.{{descriptionSuffix}}',
    modelsDir: 'models',
    servicesDir: 'services',
    hooks: {},
};
