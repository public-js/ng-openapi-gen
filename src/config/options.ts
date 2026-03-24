import type { Options as YargsOptions } from 'yargs-parser';

import { internalDefaultOptions, optionMetadata } from './option-metadata.js';

export interface OptionsInput {
    input: string;
    output?: string;
    verbose?: boolean;
    defaultTag?: string;
    fetchTimeout?: number;
    includeTags?: string[];
    excludeTags?: string[];
    ignoreUnusedModels?: boolean;
    removeStaleFiles?: boolean;
    modelIndex?: string | boolean;
    serviceIndex?: string | boolean;
    indexFile?: boolean;
    servicePrefix?: string;
    serviceSuffix?: string;
    modelPrefix?: string;
    modelSuffix?: string;
    module?: string | boolean;
    configurationFile?: string;
    rootUrlToken?: string;
    requestBuilder?: string;
    response?: string;
    enumStyle?: 'alias' | 'upper' | 'ignorecase' | 'pascal';
    injectionStyle?: 'constructor' | 'inject';
    hooks?: string | string[];
    excludeParameters?: string[];
    skipJsonSuffix?: boolean;
    fallbackPropertyType?: string;
    bigintStyle?: 'number' | 'bigint';
    endOfLineStyle?: 'lf' | 'cr' | 'crlf' | 'auto';
    runEslint?: boolean;
    runPrettier?: boolean;
    generateResponseMethod?: boolean;
    modelsDir?: string;
    servicesDir?: string;
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
    | 'injectionStyle'
    | 'hooks'
    | 'skipJsonSuffix'
    | 'fallbackPropertyType'
    | 'bigintStyle'
    | 'endOfLineStyle'
    | 'runEslint'
    | 'runPrettier'
    | 'generateResponseMethod'
    | 'modelsDir'
    | 'servicesDir';

export type Options = Required<Pick<OptionsInput, DefaultedOptions>> &
    Omit<OptionsInput, 'hooks'> & {
        input: string;
        hooks: string[];
    };

export const defaultOptions: Required<Pick<OptionsInput, DefaultedOptions>> = {
    output: optionMetadata.output.default as string,
    verbose: optionMetadata.verbose.default as boolean,
    defaultTag: optionMetadata.defaultTag.default as string,
    fetchTimeout: optionMetadata.fetchTimeout.default as number,
    includeTags: [...((optionMetadata.includeTags.default as unknown as string[]) ?? [])],
    excludeTags: [...((optionMetadata.excludeTags.default as unknown as string[]) ?? [])],
    ignoreUnusedModels: optionMetadata.ignoreUnusedModels.default as boolean,
    removeStaleFiles: optionMetadata.removeStaleFiles.default as boolean,
    modelIndex: optionMetadata.modelIndex.default as string,
    serviceIndex: optionMetadata.serviceIndex.default as string,
    indexFile: optionMetadata.indexFile.default as boolean,
    servicePrefix: optionMetadata.servicePrefix.default as string,
    serviceSuffix: optionMetadata.serviceSuffix.default as string,
    modelPrefix: optionMetadata.modelPrefix.default as string,
    modelSuffix: optionMetadata.modelSuffix.default as string,
    module: optionMetadata.module.default as string,
    configurationFile: optionMetadata.configurationFile.default as string,
    rootUrlToken: optionMetadata.rootUrlToken.default as string,
    requestBuilder: optionMetadata.requestBuilder.default as string,
    response: optionMetadata.response.default as string,
    enumStyle: optionMetadata.enumStyle.default as Options['enumStyle'],
    injectionStyle: optionMetadata.injectionStyle.default as Options['injectionStyle'],
    hooks: [],
    skipJsonSuffix: optionMetadata.skipJsonSuffix.default as boolean,
    fallbackPropertyType: optionMetadata.fallbackPropertyType.default as string,
    bigintStyle: optionMetadata.bigintStyle.default as Options['bigintStyle'],
    endOfLineStyle: optionMetadata.endOfLineStyle.default as Options['endOfLineStyle'],
    runEslint: optionMetadata.runEslint.default as boolean,
    runPrettier: optionMetadata.runPrettier.default as boolean,
    generateResponseMethod: optionMetadata.generateResponseMethod.default as boolean,
    modelsDir: internalDefaultOptions.modelsDir,
    servicesDir: internalDefaultOptions.servicesDir,
};

export function normalizeHooks(value: OptionsInput['hooks']): string[] {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function resolveOptions(input: Partial<OptionsInput>): Options {
    return {
        ...defaultOptions,
        ...input,
        includeTags: [...(input.includeTags ?? defaultOptions.includeTags)],
        excludeTags: [...(input.excludeTags ?? defaultOptions.excludeTags)],
        hooks: normalizeHooks(input.hooks),
    } as Options;
}

export function createCliParserOptions(): YargsOptions & { array: Array<string | { key: string; number?: true }> } {
    const result: YargsOptions & { array: Array<string | { key: string; number?: true }> } = {
        string: ['config'],
        number: [],
        boolean: [],
        array: [],
        alias: { config: 'c' },
        configuration: { 'strip-dashed': true, 'strip-aliased': true },
    };

    for (const [name, metadata] of Object.entries(optionMetadata)) {
        if (!metadata.cli) {
            continue;
        }
        switch (metadata.kind) {
            case 'string':
            case 'stringOrBoolean':
            case 'enum':
            case 'object':
                (result.string as string[]).push(name);
                break;
            case 'number':
                (result.number as string[]).push(name);
                break;
            case 'boolean':
                (result.boolean as string[]).push(name);
                break;
            case 'stringArray':
            case 'stringArrayOrString':
                result.array.push(name);
                break;
        }
        if (metadata.alias) {
            (result.alias as Record<string, string>)[name] = metadata.alias;
        }
    }
    return result;
}
