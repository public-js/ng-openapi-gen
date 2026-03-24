import { mkdtempSync, writeFileSync } from 'node:fs';
import { existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import { runCli } from '../../src/cli/main.js';

describe('cli', () => {
    test('runs generation from a config file', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-cli-'));
        const outputDir = join(tempDir, 'generated');
        const configPath = join(tempDir, 'config.json');

        writeFileSync(
            configPath,
            JSON.stringify(
                {
                    input: resolve(process.cwd(), 'test/fixtures/inputs/petstore.json'),
                    output: outputDir,
                    modelPrefix: 'Petstore',
                    modelSuffix: 'Model',
                    bigintStyle: 'bigint',
                },
                null,
                2,
            ),
            'utf8',
        );

        try {
            await runCli(['--config', configPath]);
            expect(existsSync(join(outputDir, 'services', 'pets.service.ts'))).toBe(true);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
