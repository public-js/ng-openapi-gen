#!/usr/bin/env node

import { existsSync } from 'node:fs';

import yargsParser from 'yargs-parser';

import { Options } from './config/options.js';
import { generate } from './core/generate.js';
import { fileRead } from './utils/file-system.js';

const parsedArgs = yargsParser(process.argv.slice(2), {
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

    await generate(Object.assign(options, cleanArgs));
})().catch((error) => {
    process.stdout.write(`An error occurred:\n`);
    throw error;
});
