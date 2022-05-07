import { existsSync, lstatSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import fse from 'fs-extra';

export function resolveFromIMU(imu: ImportMeta['url'], ...pathSegments: string[]): string {
    return join(dirname(fileURLToPath(imu)), ...pathSegments);
}

export function fileRead(...pathSegments: string[]): string {
    return readFileSync(join(...pathSegments), { encoding: 'utf8' });
}

export function fileWrite(path: string, data: string): void {
    return writeFileSync(path, data, { encoding: 'utf8' });
}

/** Synchronizes the files from the source to the target directory. Optionally remove stale files. */
export function syncDirs(srcDir: string, destDir: string, removeStale: boolean): void {
    fse.ensureDirSync(destDir);

    const srcFiles = readdirSync(srcDir);
    for (const file of srcFiles) {
        const srcFile = join(srcDir, file);
        const destFile = join(destDir, file);
        if (lstatSync(srcFile).isDirectory()) {
            syncDirs(srcFile, destFile, removeStale);
        } else {
            // Read the content of both files and update if they differ
            const srcContent = fileRead(srcFile);
            const destContent = existsSync(destFile) ? fileRead(destFile) : null;
            if (srcContent !== destContent) {
                fileWrite(destFile, srcContent);
                console.debug('Wrote ' + destFile);
            }
        }
    }

    if (removeStale) {
        const destFiles = readdirSync(destDir);
        for (const file of destFiles) {
            const srcFile = join(srcDir, file);
            const destFile = join(destDir, file);
            if (!existsSync(srcFile) && lstatSync(destFile).isFile()) {
                unlinkSync(destFile);
                console.debug('Removed stale file ' + destFile);
            }
        }
    }
}
