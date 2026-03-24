import { realpathSync } from 'node:fs';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { OpenAPIObject } from 'openapi3-ts';

import { defaultOptions, Options } from '../config/options.js';
import { joinIfExists } from '../utils/file-system.js';
import { Generator } from './generator.js';

export async function generate(input: Partial<Options>): Promise<void> {
    const options = Object.assign({}, defaultOptions, input) as Options;

    if (!options.input) {
        throw new Error(`No input file path or URL is specified.`);
    }

    const openApi = (await $RefParser.bundle(options.input, {
        dereference: { circular: false },
        resolve: { http: { timeout: options.fetchTimeout } },
    })) as OpenAPIObject;

    options.hooks = await loadHooks(options);

    await new Generator(openApi, options).generate();
    options.hooks.generation$post && Function.call(options.hooks.generation$post, undefined, openApi, options);
}

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
