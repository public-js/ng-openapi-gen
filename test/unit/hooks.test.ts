import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import { generate } from '../../src/index.js';

const petstoreInput = resolve(process.cwd(), 'test/fixtures/inputs/petstore.json');

describe('hooks', () => {
    test('loads hooks, mutates source files, and generates additional files', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-hooks-'));
        const hookPath = join(tempDir, 'hook.mjs');
        const outputDir = join(tempDir, 'output');

        writeFileSync(
            hookPath,
            `
            export default {
              generateAdditionalFiles(context) {
                context.registerGeneratedFile({
                  relativePath: 'hook-note.txt',
                  content: 'hook-note'
                });
              },
              transformSourceFile(sourceFile, metadata) {
                if (metadata.id === 'support:configuration') {
                  sourceFile.addStatements("export const HOOK_MARKER = true;");
                }
              }
            };
            `,
            'utf8',
        );

        try {
            await generate({
                input: petstoreInput,
                output: outputDir,
                hooks: [hookPath],
            });

            expect(readFileSync(join(outputDir, 'hook-note.txt'), 'utf8')).toBe('hook-note');
            expect(readFileSync(join(outputDir, 'api-configuration.ts'), 'utf8')).toContain('HOOK_MARKER');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
