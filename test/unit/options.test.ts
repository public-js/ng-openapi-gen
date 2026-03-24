import { describe, expect, test } from 'vitest';

import { defaultOptions, resolveOptions } from '../../src/config/options.js';

describe('options', () => {
    test('resolveOptions applies defaults', () => {
        const options = resolveOptions({
            input: 'spec.json',
        });

        expect(options.output).toBe(defaultOptions.output);
        expect(options.includeTags).toEqual([]);
    });

    test('resolveOptions applies the generator defaults', () => {
        const options = resolveOptions({
            input: 'spec.json',
        });

        expect(options.generateResponseMethod).toBe(true);
        expect(options.injectionStyle).toBe('constructor');
    });
});
