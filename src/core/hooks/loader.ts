import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { GeneratorHook } from './types.js';

function normalizeHookExport(value: unknown): GeneratorHook[] {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value as GeneratorHook[];
    }
    return [value as GeneratorHook];
}

export async function loadHooks(hooks: string[]): Promise<GeneratorHook[]> {
    const resolvedHooks: GeneratorHook[] = [];
    for (const hookPath of hooks) {
        const moduleUrl = pathToFileURL(resolve(hookPath)).href;
        const imported = (await import(moduleUrl)) as { default?: GeneratorHook | GeneratorHook[] };
        resolvedHooks.push(...normalizeHookExport(imported.default));
    }
    return resolvedHooks;
}
