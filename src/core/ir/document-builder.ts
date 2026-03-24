import type { OpenAPIObject, OperationObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import type { Options } from '../../config/options.js';
import { methodName, refName } from '../../utils/string.js';
import { HookRunner } from '../hooks/runner.js';
import type { GeneratorDocument } from './document.js';
import { Globals } from './legacy/globals.js';
import { OaImport } from './legacy/oa-import.js';
import { OaModel } from './legacy/oa-model.js';
import { HTTP_METHODS, OaOperation } from './legacy/oa-operation.js';
import { OaService } from './legacy/oa-service.js';
import type { GeneratorLogger } from '../runtime/logger.js';

export class GeneratorDocumentBuilder {
    private readonly globals: Globals;
    private readonly imports = new Map<string, OaImport>();
    private readonly models = new Map<string, OaModel>();
    private readonly services = new Map<string, OaService>();
    private readonly operationsByTag = new Map<string, OaOperation[]>();
    private readonly operations = new Map<string, OaOperation>();

    constructor(
        private openApi: OpenAPIObject,
        private readonly options: Options,
        private readonly hooks: HookRunner,
        private readonly logger: GeneratorLogger,
    ) {
        this.globals = new Globals(options);
    }

    public async build(): Promise<GeneratorDocument> {
        await this.collectModels();
        await this.collectOperations();
        await this.collectServices();

        if (this.options.ignoreUnusedModels !== false) {
            this.ignoreUnusedModels();
        }

        const document = this.toDocument();
        await this.hooks.transformDocument(document, { openApi: this.openApi, document });
        return this.toDocument();
    }

    private async collectModels(): Promise<void> {
        const schemas = (this.openApi.components || {}).schemas || {};
        for (const [name, schema] of Object.entries(schemas)) {
            const model = new OaModel(this.openApi, schema as SchemaObject, name, this.options);
            this.models.set(name, model);
            await this.hooks.transformModel(model, { openApi: this.openApi });
        }
        this.shortenModels();
        for (const [name, model] of this.models.entries()) {
            this.imports.set(name, new OaImport().fromModel(model));
        }
        for (const model of this.models.values()) {
            model.collectImports(this.imports);
        }
    }

    private async collectOperations(): Promise<void> {
        for (const [opPath, pathSpec] of Object.entries(this.openApi.paths || {})) {
            for (const method of HTTP_METHODS) {
                const methodSpec: OperationObject | undefined = pathSpec[method];
                if (!methodSpec) {
                    continue;
                }

                let id = methodSpec.operationId;
                id = id ? methodName(id) : methodName(`${opPath}.${method}`);

                if (this.operations.has(id)) {
                    let suffix = 0;
                    let tryId = id;
                    while (this.operations.has(tryId)) {
                        tryId = `${id}_${++suffix}`;
                    }
                    this.logger.warn(
                        `Duplicate operation id '${id}'. Assuming id ${tryId} for operation '${opPath}.${method}'.`,
                    );
                    id = tryId;
                }

                const operation = new OaOperation(this.openApi, opPath, pathSpec, method, id, methodSpec, this.options);
                if (operation.tags.length === 0) {
                    this.logger.warn(
                        `No tags set on operation '${opPath}.${method}'. Assuming '${this.options.defaultTag}'.`,
                    );
                    operation.tags.push(this.options.defaultTag);
                }

                await this.hooks.transformOperation(operation, { openApi: this.openApi });

                for (const tag of operation.tags) {
                    const list = this.operationsByTag.get(tag) ?? [];
                    list.push(operation);
                    this.operationsByTag.set(tag, list);
                }
                this.operations.set(id, operation);
            }
        }
    }

    private async collectServices(): Promise<void> {
        const tags = this.openApi.tags || [];
        for (const [tagName, operations] of this.operationsByTag.entries()) {
            if (this.options.includeTags.length > 0 && !this.options.includeTags.includes(tagName)) {
                this.logger.debug(`Ignoring tag ${tagName} because it is not listed in the 'includeTags' option.`);
                continue;
            }
            if (this.options.excludeTags.length > 0 && this.options.excludeTags.includes(tagName)) {
                this.logger.debug(`Ignoring tag ${tagName} because it is listed in the 'excludeTags' option.`);
                continue;
            }
            const tag = tags.find((candidate) => candidate.name === tagName) || { name: tagName };
            const service = new OaService(tag, operations || [], this.options);
            await this.hooks.transformService(service, { openApi: this.openApi });
            service.collectImports(this.imports);
            this.services.set(tag.name, service);
        }
    }

    private ignoreUnusedModels(): void {
        const usedNames = new Set<string>();
        for (const service of this.services.values()) {
            for (const imp of service.imports) {
                usedNames.add(imp.refName);
            }
            for (const imp of service.additionalDependencies) {
                usedNames.add(imp);
            }
        }

        const referenced = Array.from(usedNames);
        usedNames.clear();
        for (const name of referenced) {
            this.collectDependencies(name, usedNames);
        }

        for (const model of this.models.values()) {
            if (!usedNames.has(model.name)) {
                this.logger.debug(`Ignoring model ${model.name} because it is not used anywhere.`);
                this.models.delete(model.name);
            }
        }
    }

    private collectDependencies(name: string, usedNames: Set<string>): void {
        const model = this.models.get(name);
        if (!model || usedNames.has(model.name)) {
            return;
        }
        usedNames.add(model.name);
        for (const nameRef of this.allReferencedNames(model.schema)) {
            this.collectDependencies(nameRef, usedNames);
        }
    }

    private allReferencedNames(schema: SchemaObject | ReferenceObject | undefined): string[] {
        if (!schema) {
            return [];
        }
        if ('$ref' in schema && schema.$ref) {
            return [refName(schema.$ref)];
        }
        const definition = schema as SchemaObject;

        const result: string[] = [];
        for (const candidate of definition.allOf || []) {
            result.push(...this.allReferencedNames(candidate));
        }
        for (const candidate of definition.anyOf || []) {
            result.push(...this.allReferencedNames(candidate));
        }
        for (const candidate of definition.oneOf || []) {
            result.push(...this.allReferencedNames(candidate));
        }
        if (definition.properties) {
            for (const candidate of Object.values(definition.properties)) {
                result.push(...this.allReferencedNames(candidate));
            }
        }
        if (typeof definition.additionalProperties === 'object') {
            result.push(...this.allReferencedNames(definition.additionalProperties));
        }
        if (definition.items) {
            result.push(...this.allReferencedNames(definition.items));
        }
        return result;
    }

    private shortenModels(): void {
        const typeNamesCount = new Map<string, Set<string>>();
        for (const [refNameKey, model] of this.models.entries()) {
            const occurrences = typeNamesCount.get(model.typeName) || new Set<string>();
            occurrences.add(refNameKey);
            typeNamesCount.set(model.typeName, occurrences);
        }
        for (const model of this.models.values()) {
            if ((typeNamesCount.get(model.typeName) ?? new Set()).size === 1) {
                model.assumedName = model.typeName;
                continue;
            }
            if (model.typeName !== model.assumedName && !typeNamesCount.has(model.assumedName)) {
                continue;
            }

            let suffix = 1;
            let tryName = `${model.typeName}${suffix}`;
            while (typeNamesCount.has(tryName)) {
                tryName = `${model.typeName}${++suffix}`;
            }
            model.assumedName = tryName;
        }
    }

    private toDocument(): GeneratorDocument {
        const models = Array.from(this.models.values()).sort((a, b) => a.fileName.localeCompare(b.fileName));
        const services = Array.from(this.services.values()).sort((a, b) => a.fileName.localeCompare(b.fileName));
        const operations = Array.from(this.operations.values()).sort((a, b) => a.id.localeCompare(b.id));

        return {
            openApi: this.openApi,
            options: this.options,
            logger: this.logger,
            globals: this.globals,
            models,
            operations,
            services,
            modelsById: new Map(models.map((model) => [modelId(model.name), model])),
            operationsById: new Map(operations.map((operation) => [operation.id, operation])),
            servicesById: new Map(services.map((service) => [service.name, service])),
        };
    }
}

export function modelId(name: string): string {
    return `#/components/schemas/${name}`;
}
