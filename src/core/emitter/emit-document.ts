import { IndentationText, Project, QuoteKind, type SourceFile } from 'ts-morph';

import type { GeneratedFile, GeneratorDocument } from '../generation/document.js';
import type { HookRunner } from '../hooks/runner.js';
import { buildModelSourceFile } from './model-source-file.js';
import { buildServiceSourceFile } from './service-emitter.js';
import {
    buildConfigurationSourceFile,
    buildModelIndexSourceFile,
    buildModuleSourceFile,
    buildRootIndexSourceFile,
    buildServiceIndexSourceFile,
    renderRequestBuilder,
} from './support-source-files.js';

const PRETTIER_CONFIG =
    "export default {\n  overrides: [{ files: ['*.ts', '**/*.ts'], options: { printWidth: 900 } }],\n};\n";

export async function emitDocument(document: GeneratorDocument, hooks: HookRunner): Promise<GeneratedFile[]> {
    const { globals, options } = document;
    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            useTrailingCommas: false,
        },
    });

    const tsFiles = new Map<string, { id: string; relativePath: string }>();
    const addFile = (id: string, relativePath: string, content = ''): SourceFile => {
        const sourceFile = project.createSourceFile(`/virtual/${relativePath}`, content, { overwrite: true });
        tsFiles.set(sourceFile.getFilePath(), { id, relativePath });
        return sourceFile;
    };

    for (const model of document.models) {
        buildModelSourceFile(addFile(`model:${model.name}`, `${options.modelsDir}/${model.fileName}.ts`), model);
    }
    for (const service of document.services) {
        const sourceFile = addFile(`service:${service.name}`, `${options.servicesDir}/${service.fileName}.ts`);
        buildServiceSourceFile(sourceFile, service, document);
    }

    buildConfigurationSourceFile(addFile('support:configuration', `${globals.configurationFile}.ts`), document);
    addFile('support:request-builder', `${globals.requestBuilderFile}.ts`, renderRequestBuilder(document));
    if (globals.includePrettier) {
        addFile('support:prettier-config', 'prettier.config.mjs', PRETTIER_CONFIG);
    }
    if (globals.moduleClass && globals.moduleFile) {
        buildModuleSourceFile(addFile('support:module', `${globals.moduleFile}.ts`), document);
    }
    if (globals.modelIndexFile) {
        buildModelIndexSourceFile(addFile('support:model-index', `${globals.modelIndexFile}.ts`), document);
    }
    if (globals.serviceIndexFile) {
        buildServiceIndexSourceFile(addFile('support:service-index', `${globals.serviceIndexFile}.ts`), document);
    }
    if (options.indexFile) {
        buildRootIndexSourceFile(addFile('support:index', 'index.ts'), document);
    }

    /** Files that hooks create directly in the project have no metadata yet */
    const metadataOf = (sourceFile: SourceFile) => {
        const path = sourceFile.getFilePath();
        const relativePath = path.replace(/^\/(virtual\/)?/, '');
        return tsFiles.get(path) ?? { id: `hook:${relativePath}`, relativePath };
    };

    const hookContext = { openApi: document.openApi, document, project };
    await hooks.generateAdditionalFiles(hookContext);
    const hookFiles = hooks.drainGeneratedFiles();
    for (const extra of hookFiles) {
        if (extra.kind === 'ts') {
            addFile(extra.id ?? `hook:${extra.relativePath}`, extra.relativePath, extra.content);
        }
    }

    for (const sourceFile of project.getSourceFiles().sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()))) {
        await hooks.transformSourceFile(sourceFile, metadataOf(sourceFile), hookContext);
    }

    const files: GeneratedFile[] = project.getSourceFiles().map((sourceFile) => ({
        ...metadataOf(sourceFile),
        kind: 'ts',
        content: sourceFile.getFullText(),
    }));

    // Files registered during the transforms above are too late for them and are written as they are
    const hookTextFiles = hookFiles.filter((extra) => extra.kind !== 'ts');
    for (const extra of [...hookTextFiles, ...hooks.drainGeneratedFiles()]) {
        const { id = `hook:${extra.relativePath}`, kind = 'text', relativePath, content } = extra;
        files.push({ id, kind, relativePath, content });
    }

    return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
