import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';
import { dirname, join, normalize } from 'node:path';

import type { Options } from '../../config/options.js';
import type { WrittenFile } from '../hooks/types.js';
import type { GeneratedFile } from '../generation/document.js';
import type { GeneratorLogger } from '../runtime/logger.js';

const LINE_ENDINGS: Record<Options['endOfLineStyle'], string> = { lf: '\n', cr: '\r', crlf: '\r\n', auto: EOL };

/** Writes the files that changed. When `removeStaleFiles` is set, also removes other files from the same folders. */
export function writeGeneratedFiles(files: GeneratedFile[], options: Options, logger: GeneratorLogger): WrittenFile[] {
    const lineEnding = LINE_ENDINGS[options.endOfLineStyle];
    const written = files.map((file) => ({
        id: file.id,
        relativePath: file.relativePath,
        absolutePath: join(options.output, file.relativePath),
    }));

    mkdirSync(options.output, { recursive: true });
    for (const [index, file] of files.entries()) {
        const { absolutePath } = written[index];
        const content = file.content.replace(/\r\n|\r|\n/g, lineEnding);
        const previous = existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null;
        if (content !== previous) {
            mkdirSync(dirname(absolutePath), { recursive: true });
            writeFileSync(absolutePath, content, 'utf8');
            logger.debug(`${previous === null ? 'Created' : 'Updated'} file ${absolutePath}`);
        }
    }

    if (options.removeStaleFiles) {
        removeStaleFiles(options.output, files, logger);
    }
    return written;
}

/**
 * Sweeps only the output root and the folders holding generated files, so that other folders are left alone.
 * Never goes above the output root, even when a hook registers a path such as `../file.ts`.
 */
function removeStaleFiles(outputDir: string, files: GeneratedFile[], logger: GeneratorLogger): void {
    const generated = new Set(files.map((file) => join(outputDir, file.relativePath)));
    const folders = new Set(['.']);
    for (const file of files) {
        let dir = dirname(normalize(file.relativePath));
        while (dir !== dirname(dir) && !dir.startsWith('..')) {
            folders.add(dir);
            dir = dirname(dir);
        }
    }

    for (const folder of folders) {
        const folderPath = join(outputDir, folder);
        for (const entry of readdirSync(folderPath, { withFileTypes: true })) {
            const path = join(folderPath, entry.name);
            if (entry.isFile() && !generated.has(path)) {
                unlinkSync(path);
                logger.debug(`Removed stale file ${path}`);
            }
        }
    }
}
