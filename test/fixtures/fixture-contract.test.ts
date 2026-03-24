import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import { generate } from '../../src/index.js';
import { canonicalizeTypeScript } from './canonical-ts.js';

const fixturesDir = resolve(process.cwd(), 'test/fixtures');
const inputsDir = join(fixturesDir, 'inputs');
const expectedDir = join(fixturesDir, 'expected');

const configs = readdirSync(inputsDir)
    .filter((file) => file.endsWith('.config.json'))
    .sort();

describe('fixture contracts', () => {
    for (const configFile of configs) {
        const fixtureName = configFile.replace(/\.config\.json$/, '');
        test(fixtureName, async () => {
            const config = JSON.parse(readFileSync(join(inputsDir, configFile), 'utf8')) as Record<string, unknown>;
            const outputDir = mkdtempSync(join(tmpdir(), `ng-openapi-gen-${fixtureName}-`));

            try {
                await generate({
                    ...config,
                    input: join(inputsDir, String(config.input)),
                    output: outputDir,
                });

                const expectedFiles = listFixtureFiles(join(expectedDir, fixtureName));
                const actualFiles = listFixtureFiles(outputDir);
                expect(actualFiles).toEqual(expectedFiles);

                for (const relativePath of expectedFiles) {
                    const expectedPath = join(expectedDir, fixtureName, relativePath);
                    const actualPath = join(outputDir, relativePath);

                    if (relativePath.endsWith('.ts')) {
                        const expected = canonicalizeTypeScript(readFileSync(expectedPath, 'utf8'));
                        const actual = canonicalizeTypeScript(readFileSync(actualPath, 'utf8'));
                        expect(actual).toBe(expected);
                    } else {
                        expect(readFileSync(actualPath, 'utf8')).toBe(readFileSync(expectedPath, 'utf8'));
                    }
                }
            } finally {
                rmSync(outputDir, { recursive: true, force: true });
            }
        });
    }
});

function listFixtureFiles(rootDir: string, currentDir = rootDir): string[] {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    return entries
        .flatMap((entry) => {
            const absolute = join(currentDir, entry.name);
            if (entry.isDirectory()) {
                return listFixtureFiles(rootDir, absolute);
            }
            if (entry.name.endsWith('.ts') || entry.name.endsWith('.txt') || entry.name.endsWith('.mjs')) {
                return [absolute.replace(rootDir + '/', '')];
            }
            return [];
        })
        .sort();
}
