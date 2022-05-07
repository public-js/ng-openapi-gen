import { existsSync, realpathSync } from 'node:fs';
import { join } from 'node:path';

import Handlebars from 'handlebars';

export class HbProvider {
    public instance: typeof Handlebars = Handlebars;

    public async loadCustomHelpers(templatesDir: string | undefined): Promise<void> {
        if (!templatesDir) {
            return;
        }

        const loadPath =
            ifFileExists(join(templatesDir, 'handlebars.mjs')) || ifFileExists(join(templatesDir, 'handlebars.js'));
        if (!loadPath) {
            return;
        }

        const helpersFn = await import(realpathSync(loadPath));
        if (helpersFn && typeof helpersFn === 'function') {
            helpersFn.call(this.instance, this.instance);
        }
    }
}

function ifFileExists(filePath: string): string | null {
    return existsSync(filePath) ? filePath : null;
}
