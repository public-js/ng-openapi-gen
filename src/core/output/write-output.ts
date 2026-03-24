import { dirname, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import fse from 'fs-extra';

import type { Options } from '../../config/options.js';
import type { GeneratedFile } from '../ir/document.js';
import type { GeneratorLogger } from '../runtime/logger.js';
import { fileWrite, syncDirs } from '../../utils/file-system.js';

export function writeGeneratedFiles(
    files: GeneratedFile[],
    options: Options,
    logger: GeneratorLogger,
): Array<{ id: string; relativePath: string; absolutePath: string }> {
    const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-'));
    try {
        for (const file of files) {
            const absolutePath = join(tempDir, file.relativePath);
            fse.ensureDirSync(dirname(absolutePath));
            fileWrite(absolutePath, normalizeLineEndings(file.content, options.endOfLineStyle));
        }
        syncDirs(tempDir, options.output, options.removeStaleFiles, options.verbose);
        return files.map((file) => ({
            id: file.id,
            relativePath: file.relativePath,
            absolutePath: join(options.output, file.relativePath),
        }));
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
        logger.debug(`Cleaned temporary output directory ${tempDir}`);
    }
}

function normalizeLineEndings(text: string, style: Options['endOfLineStyle']): string {
    const normalized = text.replace(/\r\n|\r|\n/g, '\n');
    switch (style) {
        case 'cr':
            return normalized.replace(/\n/g, '\r');
        case 'crlf':
            return normalized.replace(/\n/g, '\r\n');
        case 'lf':
        case 'auto':
        default:
            return normalized;
    }
}
