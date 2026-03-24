import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
mkdirSync(distDir, { recursive: true });

for (const asset of ['src/schema.json', 'src/support/request-builder.ts']) {
  const source = resolve(process.cwd(), asset);
  if (existsSync(source)) {
    cpSync(source, resolve(distDir, asset.replace(/^src\//, '')));
  }
}
