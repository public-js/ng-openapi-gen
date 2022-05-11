#!/usr/bin/env node

import { existsSync } from 'node:fs';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { OpenAPIObject } from 'openapi3-ts';
import yargsParser from 'yargs-parser';

import { Generator } from './lib/generator.js';
import { defaultOptions, Options } from './lib/options.js';
import { fileRead } from './lib/utils/file-system.js';

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
    let config = {} as Options;
    if (parsedArgs.config) {
        if (existsSync(parsedArgs.config)) {
            try {
                config = JSON.parse(fileRead(parsedArgs.config));
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
    config = Object.assign({}, defaultOptions, config, cleanArgs);

    if (!config.input) {
        throw new Error(`No input file path or URL is specified.`);
    }

    const refParser = new $RefParser();
    const input = config.input;

    const openApi = (await refParser.bundle(input, {
        dereference: { circular: false },
        resolve: { http: { timeout: config.fetchTimeout } },
    })) as OpenAPIObject;

    await new Generator(openApi, config).generate();
})().catch((error) => {
    process.stdout.write(`An error occurred:\n`);
    throw error;
});
