#!/usr/bin/env node

import { existsSync, realpathSync } from 'node:fs';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { OpenAPIObject } from 'openapi3-ts';
import yargsParser from 'yargs-parser';

import { Generator } from './lib/generator.js';
import { defaultOptions, Options } from './lib/options.js';
import { fileRead, joinIfExists } from './lib/utils/file-system.js';

const parsedArgs = yargsParser(process.argv.slice(2), {
    // CONFIG_START
    string: [
        'config',
        'input',
        'output',
        'defaultTag',
        'servicePrefix',
        'serviceSuffix',
        'modelPrefix',
        'modelSuffix',
        'configurationFile',
        'rootUrlToken',
        'requestBuilder',
        'response',
        'templates',
        'fallbackPropertyType',
    ],
    number: ['fetchTimeout'],
    boolean: ['verbose', 'ignoreUnusedModels', 'removeStaleFiles', 'indexFile', 'skipJsonSuffix'],
    array: [{ key: 'includeTags' }, { key: 'excludeTags' }, { key: 'excludeParameters' }],
    alias: { config: 'c', input: 'i', output: 'o', verbose: 'v' },
    configuration: { 'strip-dashed': true, 'strip-aliased': true },
    // CONFIG_END
}) as unknown as Options & { config?: string };

(async function main() {
    let options = {} as Options;
    if (parsedArgs.config) {
        if (existsSync(parsedArgs.config)) {
            try {
                options = JSON.parse(fileRead(parsedArgs.config));
            } catch (error) {
                throw new Error(`The given config file can not be loaded: ${error.message}.`);
            }
        } else {
            throw new Error(`The given config file does not exist: ${parsedArgs.config}.`);
        }
    }

    const cleanArgs = Object.fromEntries(
        Object.entries(parsedArgs).filter(([, value]) => value !== undefined),
    ) as Options;
    options = Object.assign({}, defaultOptions, options, cleanArgs);

    if (!options.input) {
        throw new Error(`No input file path or URL is specified.`);
    }

    const input = options.input;

    const openApi = (await $RefParser.bundle(input, {
        dereference: { circular: false },
        resolve: { http: { timeout: options.fetchTimeout } },
    })) as OpenAPIObject;

    options.hooks = await loadHooks(options);

    // validateSchema(openApi, options);
    await new Generator(openApi, options).generate();
    options.hooks.generation$post && Function.call(options.hooks.generation$post, undefined, openApi, options);
})().catch((error) => {
    process.stdout.write(`An error occurred:\n`);
    throw error;
});

async function loadHooks(options: Options): Promise<Options['hooks']> {
    if (!options.templates) {
        return defaultOptions.hooks;
    }

    const loadPath =
        joinIfExists(options.templates, 'hooks.mjs') ||
        joinIfExists(options.templates, 'hooks.cjs') ||
        joinIfExists(options.templates, 'hooks.js');
    if (!loadPath) {
        return defaultOptions.hooks;
    }

    const hooks = await import(realpathSync(loadPath));
    return hooks?.default && typeof hooks.default === 'object' ? hooks.default : defaultOptions.hooks;
}
