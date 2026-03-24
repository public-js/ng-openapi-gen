import { resolve } from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { runPostProcessors } from '../../src/core/output/post-process.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';

describe('post-process', () => {
    test('runs eslint then prettier by default', async () => {
        const runner = vi.fn().mockResolvedValue({
            code: 0,
            stdout: '',
            stderr: '',
        });
        const options = resolveOptions({ input: 'spec.json', output: 'generated' });
        const logger = new GeneratorLogger(false);
        const resolver = vi.fn((name: 'eslint' | 'prettier') => `/workspace/node_modules/.bin/${name}`);

        await runPostProcessors(options, logger, runner, resolver);

        expect(logger.diagnostics.filter((entry) => entry.level === 'warn')).toHaveLength(0);
        expect(resolver).toHaveBeenNthCalledWith(1, 'eslint', [process.cwd(), resolve('generated')]);
        expect(resolver).toHaveBeenNthCalledWith(2, 'prettier', [process.cwd(), resolve('generated')]);
        expect(runner).toHaveBeenNthCalledWith(
            1,
            '/workspace/node_modules/.bin/eslint',
            ['--fix', resolve('generated')],
            process.cwd(),
        );
        expect(runner).toHaveBeenNthCalledWith(
            2,
            '/workspace/node_modules/.bin/prettier',
            ['--write', resolve('generated')],
            process.cwd(),
        );
    });

    test('skips configured tools', async () => {
        const runner = vi.fn().mockResolvedValue({
            code: 0,
            stdout: '',
            stderr: '',
        });
        const resolver = vi.fn((name: 'eslint' | 'prettier') => `/workspace/node_modules/.bin/${name}`);

        await runPostProcessors(
            resolveOptions({
                input: 'spec.json',
                runEslint: false,
                runPrettier: true,
            }),
            new GeneratorLogger(false),
            runner,
            resolver,
        );

        expect(resolver).toHaveBeenCalledTimes(1);
        expect(resolver).toHaveBeenCalledWith('prettier', [process.cwd(), resolve('src/app/api')]);
        expect(runner).toHaveBeenCalledTimes(1);
        expect(runner).toHaveBeenCalledWith(
            '/workspace/node_modules/.bin/prettier',
            ['--write', resolve('src/app/api')],
            process.cwd(),
        );
    });

    test('warns and continues when a tool fails', async () => {
        const logger = new GeneratorLogger(false);
        const runner = vi
            .fn()
            .mockResolvedValueOnce({
                code: 1,
                stdout: '',
                stderr: 'eslint failed',
            })
            .mockResolvedValueOnce({
                code: 0,
                stdout: '',
                stderr: '',
            });
        const resolver = vi.fn((name: 'eslint' | 'prettier') => `/workspace/node_modules/.bin/${name}`);

        await runPostProcessors(resolveOptions({ input: 'spec.json' }), logger, runner, resolver);

        expect(logger.diagnostics.some((entry) => entry.level === 'warn' && entry.message.includes('eslint'))).toBe(true);
        expect(runner).toHaveBeenCalledTimes(2);
    });

    test('warns and skips missing executables', async () => {
        const logger = new GeneratorLogger(false);
        const runner = vi.fn();
        const resolver = vi.fn().mockReturnValue(null);

        await runPostProcessors(resolveOptions({ input: 'spec.json' }), logger, runner, resolver);

        expect(runner).not.toHaveBeenCalled();
        expect(logger.diagnostics.filter((entry) => entry.level === 'warn')).toHaveLength(2);
    });
});
