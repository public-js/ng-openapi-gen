import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildSchemaJson } from '../src/config/schema.js';

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
    repository?: string;
};
const repository = typeof packageJson.repository === 'string' ? packageJson.repository : undefined;
const schema = buildSchemaJson(repository);

writeFileSync(resolve(process.cwd(), 'src/schema.json'), JSON.stringify(schema, null, 2) + '\n', 'utf8');
