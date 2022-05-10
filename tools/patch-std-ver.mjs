import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { normalize } from 'node:path';

const filePath = normalize('node_modules/standard-version/lib/configuration.js');

if (existsSync(filePath)) {
    const content = readFileSync(filePath, { encoding: 'utf8' })
        .replace(`'.versionrc',`, `'.versionrc',\n  '.versionrc.cjs',`)
        .replace(
            `if (path.extname(configPath) === '.js') {`,
            `const ext = path.extname(configPath)\n  if (ext === '.js' || ext === '.cjs') {`,
        );
    writeFileSync(filePath, content, { encoding: 'utf8' });
}
