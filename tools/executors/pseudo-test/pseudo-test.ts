import { execSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const __dirname = resolve(process.cwd(), 'tools/executors/pseudo-test');

const testConfigs = [
    'all-operations',
    'all-types',
    'default-success-response',
    'person-place',
    'petstore',
    'polymorphic',
    'self-ref',
    'skipJsonSuffix',
];

function checkFiles(srcDir: string, destDir: string, mismatches: string[]): void {
    const srcFiles = readdirSync(srcDir);
    for (const file of srcFiles) {
        const srcFile = join(srcDir, file);
        const destFile = join(destDir, file);
        if (lstatSync(srcFile).isDirectory()) {
            checkFiles(srcFile, destFile, mismatches);
        } else {
            const srcContent = readFileSync(join(srcFile), { encoding: 'utf8' });
            const destContent = existsSync(destFile) ? readFileSync(join(destFile), { encoding: 'utf8' }) : null;
            if (srcContent !== destContent) {
                mismatches.push(srcFile);
            }
        }
    }
}

export default async function main(): Promise<{ success: boolean }> {
    const distJs = resolve(process.cwd(), 'dist/packages/ng-openapi-gen/src/ng-openapi-gen.js');
    const sourcesDir = join(__dirname, 'sources');

    const timings = new Map<string, number>();
    for (const config of testConfigs) {
        const perfStart = Date.now();
        execSync(`node ${distJs} --config ${config}.config.json`, { stdio: 'inherit', cwd: sourcesDir });
        timings.set(config, Date.now() - perfStart);
        // console.info(`Test "${config}" ran in ${perfEnd - perfStart} ms`);
    }

    const allMismatches = new Map<string, string[]>();
    for (const config of testConfigs) {
        const mismatches: string[] = [];
        checkFiles(
            join(__dirname, 'original-results', config),
            join(__dirname, 'modified-results', config),
            mismatches,
        );

        if (mismatches.length > 0) {
            const pathPrefix = join(__dirname, 'original-results', config) + '/';
            allMismatches.set(
                config,
                mismatches.map((filePath: string) => filePath.replace(pathPrefix, '')),
            );
        }
    }

    if (allMismatches.size > 0) {
        console.error(
            '\n--------------------\n\n' +
                Array.from(allMismatches.entries())
                    .map(([config, files]) => [`Found mismatched files in "${config}" test:`, ...files].join('\n- '))
                    .join('\n\n'),
        );
    }

    console.info(
        '\n--------------------\n\n' +
            Array.from(timings.entries())
                .map(([config, time]) => `Test "${config}" ran in ${time} ms`)
                .join('\n'),
    );

    return { success: allMismatches.size === 0 };
}
