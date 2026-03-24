import { existsSync, readFileSync } from 'node:fs';

import yargsParser from 'yargs-parser';

import { createCliParserOptions, resolveOptions, type OptionsInput } from '../config/options.js';
import { generate } from '../core/generate.js';

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
    const parsed = yargsParser(argv, createCliParserOptions()) as Record<string, unknown> & { config?: string };
    let configOptions: Partial<OptionsInput> = {};

    if (typeof parsed.config === 'string') {
        if (!existsSync(parsed.config)) {
            throw new Error(`The given config file does not exist: ${parsed.config}.`);
        }
        configOptions = JSON.parse(readFileSync(parsed.config, 'utf8')) as Partial<OptionsInput>;
    }

    const cliOptions = sanitizeCliOptions(parsed);
    const options = resolveOptions({ ...configOptions, ...cliOptions });
    await generate(options);
}

function sanitizeCliOptions(parsed: Record<string, unknown>): Partial<OptionsInput> {
    const cleanEntries = Object.entries(parsed).filter(([key, value]) => {
        return !['config', '_', '--'].includes(key) && value !== undefined;
    });

    const result = Object.fromEntries(cleanEntries) as Record<string, unknown>;
    for (const key of ['modelIndex', 'serviceIndex', 'module']) {
        if (typeof result[key] === 'string') {
            if (result[key] === 'false') {
                result[key] = false;
            } else if (result[key] === 'true') {
                result[key] = true;
            }
        }
    }

    return result as Partial<OptionsInput>;
}
