import { realpathSync } from 'node:fs';

import Handlebars from 'handlebars';

import { joinIfExists } from './utils/file-system.js';

export class HbProvider {
    public instance: typeof Handlebars = Handlebars;

    constructor() {
        this.instance.registerHelper('reIndent', function (input: string, baseIndent: number): string {
            if (!input?.includes('\n')) {
                return input;
            }

            const allLines = input.split('\n');
            const middleLines = allLines.slice(1, -1);
            return [
                allLines[0],
                ...middleLines.map((line) => '  '.repeat(baseIndent + 1) + line),
                '  '.repeat(baseIndent) + allLines[allLines.length - 1],
            ].join('\n');
        });
    }

    public async loadCustomHelpers(templatesDir: string | undefined): Promise<void> {
        if (!templatesDir) {
            return;
        }

        const loadPath = joinIfExists(templatesDir, 'handlebars.mjs') || joinIfExists(templatesDir, 'handlebars.js');
        if (!loadPath) {
            return;
        }

        const helpersFn = await import(realpathSync(loadPath));
        if (helpersFn && typeof helpersFn === 'function') {
            helpersFn.call(this.instance, this.instance);
        }
    }
}
