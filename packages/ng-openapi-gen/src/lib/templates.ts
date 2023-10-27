import { readdirSync } from 'node:fs';

import eol from 'eol';
import Handlebars from 'handlebars';

import { Globals } from './globals.js';
import { fileRead } from './utils/file-system.js';
import { getFileNameIfExt, normalizeLineBreaks } from './utils/string.js';

export class Templates {
    protected templates: Record<string, Handlebars.TemplateDelegate> = {};
    protected globals: Record<string, unknown> = {};

    constructor(
        builtInDir: string,
        customDir: string,
        globals: Globals,
        protected handlebars: typeof Handlebars,
    ) {
        const customTemplates = customDir ? readdirSync(customDir) : [];
        for (const file of customTemplates) {
            this.loadTemplate(customDir, file);
        }

        const builtInTemplates = readdirSync(builtInDir);
        for (const file of builtInTemplates) {
            this.loadTemplate(builtInDir, file);
        }

        this.setGlobals(globals);
    }

    /**
     * Applies a template with a given model
     * @param templateName The template name (file without .handlebars extension)
     * @param model The model variables to be passed in to the template
     */
    public apply(templateName: string, model?: object | null | undefined): string {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }
        const actualModel: Record<string, unknown> = { ...this.globals, ...((model || {}) as Record<string, unknown>) };
        return template(actualModel);
    }

    protected loadTemplate(dir: string, file: string): void {
        const partialName = getFileNameIfExt(file, '.handlebars');
        if (partialName && !this.templates[partialName]) {
            const contents = eol.auto(fileRead(dir, file));
            const compiled = this.handlebars.compile(normalizeLineBreaks(contents));
            this.templates[partialName] = compiled;
            this.handlebars.registerPartial(partialName, compiled);
        }
    }

    protected setGlobals(globals: Globals): void {
        for (const [name, value] of Object.entries(globals)) {
            this.globals[name] = value;
        }
    }
}
