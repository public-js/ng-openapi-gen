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

export type Options = Required<Omit<OptionsInput, 'hooks' | 'excludeParameters'>> &
    Pick<OptionsInput, 'excludeParameters'> & {
        hooks: string[];
    };

export const defaultOptions = {
    ...Object.fromEntries(
        Object.entries(optionMetadata)
            .filter(([, metadata]) => metadata.default !== undefined)
            .map(([name, metadata]) => [name, metadata.default]),
    ),
    hooks: [],
    ...internalDefaultOptions,
} as unknown as Omit<Options, 'input' | 'excludeParameters'>;

function normalizeHooks(value: OptionsInput['hooks']): string[] {
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

const CLI_TYPES = {
    string: 'string',
    stringOrBoolean: 'string',
    enum: 'string',
    number: 'number',
    boolean: 'boolean',
    stringArray: 'array',
    stringArrayOrString: 'array',
} as const;

export function createCliParserOptions(): YargsOptions {
    const types: Record<(typeof CLI_TYPES)[keyof typeof CLI_TYPES], string[]> = {
        string: ['config'],
        number: [],
        boolean: [],
        array: [],
    };
    const alias: Record<string, string> = { config: 'c' };

    for (const [name, metadata] of Object.entries(optionMetadata)) {
        if (metadata.cli) {
            types[CLI_TYPES[metadata.kind]].push(name);
            if (metadata.alias) {
                alias[name] = metadata.alias;
            }
        }
    }
    return { ...types, alias, configuration: { 'strip-dashed': true, 'strip-aliased': true } };
}
