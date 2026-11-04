import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, test } from 'vitest';

import { generate } from '../../src/index.js';

const fixturesDir = resolve(process.cwd(), 'test/fixtures');
const inputsDir = join(fixturesDir, 'inputs');

describe('manual', () => {
    test('fixture', async () => {
        const configPath = join(inputsDir, 'all-types.config.json');
        console.log('configPath:', configPath);
        const config = JSON.parse(readFileSync(configPath, 'utf8')) as Record<string, unknown>;
        await generate({ ...config, input: join(inputsDir, String(config.input)) });
    });
});
