import type { OpenAPIObject } from 'openapi3-ts';
import type { Project, SourceFile } from 'ts-morph';

import type { GeneratorDocument } from '../ir/document.js';
import type { OaModel } from '../ir/legacy/oa-model.js';
import type { OaOperation } from '../ir/legacy/oa-operation.js';
import type { OaService } from '../ir/legacy/oa-service.js';
import type { GeneratorLogger } from '../runtime/logger.js';
import type { GeneratorHook, HookContext, HookGeneratedFile } from './types.js';
import type { Options } from '../../config/options.js';

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

    public takeGeneratedFiles(): HookGeneratedFile[] {
        return [...this.generatedFiles];
    }

    public async transformOpenApi(openApi: OpenAPIObject): Promise<OpenAPIObject> {
        let current = openApi;
        for (const hook of this.hooks) {
            if (!hook.transformOpenApi) {
                continue;
            }
            const next = await hook.transformOpenApi(current, this.createContext({ openApi: current }));
            if (next) {
                current = next;
            }
        }
        return current;
    }

    public async transformModel(model: OaModel, extras: HookContextExtras): Promise<void> {
        for (const hook of this.hooks) {
            await hook.transformModel?.(model, this.createContext(extras));
        }
    }

    public async transformOperation(operation: OaOperation, extras: HookContextExtras): Promise<void> {
        for (const hook of this.hooks) {
            await hook.transformOperation?.(operation, this.createContext(extras));
        }
    }

    public async transformService(service: OaService, extras: HookContextExtras): Promise<void> {
        for (const hook of this.hooks) {
            await hook.transformService?.(service, this.createContext(extras));
        }
    }

    public async transformDocument(document: GeneratorDocument, extras: HookContextExtras): Promise<void> {
        for (const hook of this.hooks) {
            await hook.transformDocument?.(document, this.createContext({ ...extras, document }));
        }
    }

    public async generateAdditionalFiles(extras: HookContextExtras): Promise<void> {
        for (const hook of this.hooks) {
            await hook.generateAdditionalFiles?.(this.createContext(extras));
        }
    }

    public async transformSourceFile(
        sourceFile: SourceFile,
        metadata: { id: string; relativePath: string },
        extras: HookContextExtras,
    ): Promise<void> {
        for (const hook of this.hooks) {
            await hook.transformSourceFile?.(sourceFile, metadata, this.createContext(extras));
        }
    }

    public async afterWrite(
        files: Array<{ id: string; relativePath: string; absolutePath: string }>,
        extras: HookContextExtras,
    ): Promise<void> {
        for (const hook of this.hooks) {
            await hook.afterWrite?.(files, this.createContext(extras));
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
