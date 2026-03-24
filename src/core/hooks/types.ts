import type { OpenAPIObject } from 'openapi3-ts';
import type { Project, SourceFile } from 'ts-morph';

import type { Options } from '../../config/options.js';
import type { GeneratorDocument, GeneratedFileKind } from '../ir/document.js';
import type { OaModel } from '../ir/legacy/oa-model.js';
import type { OaOperation } from '../ir/legacy/oa-operation.js';
import type { OaService } from '../ir/legacy/oa-service.js';
import type { GeneratorLogger } from '../runtime/logger.js';

export interface HookGeneratedFile {
    id?: string;
    kind?: GeneratedFileKind;
    relativePath: string;
    content: string;
}

export interface HookContext {
    options: Options;
    logger: GeneratorLogger;
    openApi?: OpenAPIObject;
    document?: GeneratorDocument;
    project?: Project;
    getModel(id: string): OaModel | undefined;
    getOperation(id: string): OaOperation | undefined;
    getService(id: string): OaService | undefined;
    registerGeneratedFile(file: HookGeneratedFile): void;
}

export interface GeneratorHook {
    transformOpenApi?: (openApi: OpenAPIObject, context: HookContext) => Promise<OpenAPIObject | void> | OpenAPIObject | void;
    transformDocument?: (document: GeneratorDocument, context: HookContext) => Promise<void> | void;
    transformModel?: (model: OaModel, context: HookContext) => Promise<void> | void;
    transformOperation?: (operation: OaOperation, context: HookContext) => Promise<void> | void;
    transformService?: (service: OaService, context: HookContext) => Promise<void> | void;
    generateAdditionalFiles?: (context: HookContext) => Promise<void> | void;
    transformSourceFile?: (
        sourceFile: SourceFile,
        metadata: { id: string; relativePath: string },
        context: HookContext,
    ) => Promise<void> | void;
    afterWrite?: (
        files: Array<{ id: string; relativePath: string; absolutePath: string }>,
        context: HookContext,
    ) => Promise<void> | void;
}

export function defineHook<T extends GeneratorHook>(hook: T): T {
    return hook;
}
