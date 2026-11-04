import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { Project, SourceFile } from 'ts-morph';

import type { Options } from '../../config/options.js';
import type { GeneratorDocument } from '../generation/document.js';
import type { OaModel } from '../models/oa-model.js';
import type { OaOperation } from '../models/oa-operation.js';
import type { OaService } from '../models/oa-service.js';
import type { GeneratorLogger } from '../runtime/logger.js';
import type { GeneratorHook, HookContext, HookGeneratedFile, SourceFileMetadata, WrittenFile } from './types.js';

export class HookRunner {
    private readonly generatedFiles: HookGeneratedFile[] = [];

    constructor(
        private readonly hooks: GeneratorHook[],
        private readonly options: Options,
        private readonly logger: GeneratorLogger,
    ) {}

    public registerGeneratedFile(file: HookGeneratedFile): void {
        this.generatedFiles.push(file);
    }

    /** Returns the files registered so far and forgets them. */
    public drainGeneratedFiles(): HookGeneratedFile[] {
        return this.generatedFiles.splice(0);
    }

    public async transformOpenApi(openApi: OpenAPIObject): Promise<OpenAPIObject> {
        let current = openApi;
        for (const hook of this.hooks) {
            current = (await hook.transformOpenApi?.(current, this.createContext({ openApi: current }))) || current;
        }
        return current;
    }

    public transformModel(model: OaModel, extras: HookContextExtras): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.transformModel?.(model, context));
    }

    public transformOperation(operation: OaOperation, extras: HookContextExtras): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.transformOperation?.(operation, context));
    }

    public transformService(service: OaService, extras: HookContextExtras): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.transformService?.(service, context));
    }

    public transformDocument(document: GeneratorDocument, extras: HookContextExtras): Promise<void> {
        return this.runAll({ ...extras, document }, (hook, context) => hook.transformDocument?.(document, context));
    }

    public generateAdditionalFiles(extras: HookContextExtras): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.generateAdditionalFiles?.(context));
    }

    public transformSourceFile(
        sourceFile: SourceFile,
        metadata: SourceFileMetadata,
        extras: HookContextExtras,
    ): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.transformSourceFile?.(sourceFile, metadata, context));
    }

    public afterWrite(files: WrittenFile[], extras: HookContextExtras): Promise<void> {
        return this.runAll(extras, (hook, context) => hook.afterWrite?.(files, context));
    }

    private async runAll(
        extras: HookContextExtras,
        run: (hook: GeneratorHook, context: HookContext) => Promise<void> | void,
    ): Promise<void> {
        for (const hook of this.hooks) {
            await run(hook, this.createContext(extras));
        }
    }

    private createContext(extras: HookContextExtras): HookContext {
        return {
            options: this.options,
            logger: this.logger,
            openApi: extras.openApi,
            document: extras.document,
            project: extras.project,
            getModel: (id) => extras.document?.modelsById.get(id),
            getOperation: (id) => extras.document?.operationsById.get(id),
            getService: (id) => extras.document?.servicesById.get(id),
            registerGeneratedFile: (file) => this.registerGeneratedFile(file),
        };
    }
}

export interface HookContextExtras {
    openApi?: OpenAPIObject;
    document?: GeneratorDocument;
    project?: Project;
}
