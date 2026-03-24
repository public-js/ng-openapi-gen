import type { OaImport } from '../ir/legacy/oa-import.js';

export function renderImports(imports: OaImport[]): string {
    if (imports.length === 0) {
        return '';
    }
    return (
        imports
            .map(
                (imp) =>
                    `import { ${imp.typeName}${imp.useAlias ? ` as ${imp.qualifiedName}` : ''} } from '${imp.file}';`,
            )
            .join('\n') + '\n\n'
    );
}
