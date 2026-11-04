import type { OaImport } from '../models/oa-import.js';

/** A named import or export specifier for the given import, aliased when needed. */
export function namedSpecifier(imp: OaImport): { name: string; alias?: string } {
    return { name: imp.typeName, alias: imp.useAlias ? imp.qualifiedName : undefined };
}

export function toDocs(text: string | undefined): string[] {
    return text ? [text] : [];
}
