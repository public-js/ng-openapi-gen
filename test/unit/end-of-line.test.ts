import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { writeGeneratedFiles } from '../../src/core/output/write-output.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';

vi.mock('node:os', async (importOriginal) => ({ ...(await importOriginal<typeof import('node:os')>()), EOL: '\r\n' }));

describe('endOfLineStyle', () => {
    test('auto uses the line ending of the current system', () => {
        const output = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-eol-'));
        try {
            writeGeneratedFiles(
                [{ id: 'file', kind: 'ts', relativePath: 'file.ts', content: 'one\ntwo\n' }],
                resolveOptions({ input: 'inline.json', output, endOfLineStyle: 'auto' }),
                new GeneratorLogger(false),
            );
            expect(readFileSync(join(output, 'file.ts'), 'utf8')).toBe('one\r\ntwo\r\n');
        } finally {
            rmSync(output, { recursive: true, force: true });
        }
    });
});
