import { IndentationText, NewLineKind, Project, QuoteKind } from 'ts-morph';

import type { GeneratorDocument, GeneratedFile } from '../generation/document.js';
import { emitRequestBuilderSource } from './support-emitter.js';
import { buildModelSourceFile } from './model-source-file.js';
import { buildServiceSourceFile } from './service-emitter.js';
import {
    buildConfigurationSourceFile,
    buildModelIndexSourceFile,
    buildModuleSourceFile,
    buildRootIndexSourceFile,
    buildServiceIndexSourceFile,
} from './support-source-files.js';

export function emitDocument(document: GeneratorDocument): GeneratedFile[] {
    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            newLineKind: toNewLineKind(document.options.endOfLineStyle),
            indentationText: IndentationText.TwoSpaces,
            quoteKind: QuoteKind.Single,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            useTrailingCommas: false,
        },
    });

    const tsFiles = new Map<string, { id: string; relativePath: string }>();
    const createSourceFile = (id: string, relativePath: string) => {
        const sourceFile = project.createSourceFile(`/virtual/${relativePath}`, '', { overwrite: true });
        tsFiles.set(sourceFile.getFilePath(), { id, relativePath });
        return sourceFile;
    };
    const createTextSourceFile = (id: string, relativePath: string, content: string) => {
        const sourceFile = project.createSourceFile(`/virtual/${relativePath}`, content, { overwrite: true });
        tsFiles.set(sourceFile.getFilePath(), { id, relativePath });
    };

    for (const model of document.models) {
        buildModelSourceFile(
            createSourceFile(`model:${model.name}`, `${document.options.modelsDir}/${model.fileName}.ts`),
            model,
        );
    }
    for (const service of document.services) {
        buildServiceSourceFile(
            createSourceFile(`service:${service.name}`, `${document.options.servicesDir}/${service.fileName}.ts`),
            service,
            document,
        );
    }

    buildConfigurationSourceFile(
        createSourceFile('support:configuration', `${document.globals.configurationFile}.ts`),
        document,
    );
    createTextSourceFile(
        'support:request-builder',
        `${document.globals.requestBuilderFile}.ts`,
        emitRequestBuilderSource(document),
    );
    if (document.globals.moduleClass && document.globals.moduleFile) {
        buildModuleSourceFile(createSourceFile('support:module', `${document.globals.moduleFile}.ts`), document);
    }
    if (document.globals.modelIndexFile) {
        buildModelIndexSourceFile(
            createSourceFile('support:model-index', `${document.globals.modelIndexFile}.ts`),
            document,
        );
    }
    if (document.globals.serviceIndexFile) {
        buildServiceIndexSourceFile(
            createSourceFile('support:service-index', `${document.globals.serviceIndexFile}.ts`),
            document,
        );
    }
    if (document.options.indexFile) {
        buildRootIndexSourceFile(createSourceFile('support:index', 'index.ts'), document);
    }

    return project
        .getSourceFiles()
        .map((sourceFile) => {
            const metadata = tsFiles.get(sourceFile.getFilePath());
            if (!metadata) {
                throw new Error(`Missing source metadata for ${sourceFile.getFilePath()}`);
            }
            return {
                id: metadata.id,
                kind: 'ts' as const,
                relativePath: metadata.relativePath,
                content: sourceFile.getFullText(),
            };
        })
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function toNewLineKind(style: GeneratorDocument['options']['endOfLineStyle']): NewLineKind {
    switch (style) {
        case 'cr':
            return NewLineKind.CarriageReturnLineFeed;
        case 'crlf':
            return NewLineKind.CarriageReturnLineFeed;
        case 'lf':
        case 'auto':
        default:
            return NewLineKind.LineFeed;
    }
}
