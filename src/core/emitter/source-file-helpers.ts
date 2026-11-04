import type { OaImport } from '../models/oa-import.js';

/** A named import or export specifier for the given import, aliased when needed. */
export function namedSpecifier(imp: OaImport): { name: string; alias?: string } {
    return { name: imp.typeName, alias: imp.useAlias ? imp.qualifiedName : undefined };
}

export function toDocs(tsComments: string): string[] {
    const trimmed = tsComments.trim();
    if (!trimmed.startsWith('/**')) {
        return [];
    }
    const inner = trimmed
        .replace(/^\/\*\*\n?/, '')
        .replace(/\n?\*\/$/, '')
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd());
    return [inner.join('\n').trim()];
}
