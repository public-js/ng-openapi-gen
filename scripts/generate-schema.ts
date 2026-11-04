import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildSchemaJson } from '../src/config/schema.js';

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
    repository: { url: string };
};
const repository = packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
const schema = buildSchemaJson(repository);

writeFileSync(resolve(process.cwd(), 'src/schema.json'), JSON.stringify(schema, null, 2) + '\n', 'utf8');
