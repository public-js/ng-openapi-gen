import { describe, expect, test } from 'vitest';

import { defaultOptions, resolveOptions } from '../../src/config/options.js';

describe('options', () => {
    test('resolveOptions applies defaults and normalizes hooks', () => {
        const options = resolveOptions({
            input: 'spec.json',
            hooks: './hooks.mjs',
        });

        expect(options.output).toBe(defaultOptions.output);
        expect(options.hooks).toEqual(['./hooks.mjs']);
        expect(options.includeTags).toEqual([]);
    });

    test('resolveOptions preserves hook arrays', () => {
        const options = resolveOptions({
            input: 'spec.json',
            hooks: ['./one.mjs', './two.mjs'],
        });

        expect(options.hooks).toEqual(['./one.mjs', './two.mjs']);
    });

    test('resolveOptions enables prettier and eslint by default', () => {
        const options = resolveOptions({
            input: 'spec.json',
        });

        expect(options.runEslint).toBe(true);
        expect(options.runPrettier).toBe(true);
        expect(options.generateResponseMethod).toBe(true);
        expect(options.injectionStyle).toBe('constructor');
    });
});
