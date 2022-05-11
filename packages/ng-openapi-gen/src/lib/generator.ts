import { dirname, join, resolve } from 'node:path';

import fse from 'fs-extra';
import { OpenAPIObject, OperationObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import { Globals } from './globals.js';
import { HbProvider } from './hb-provider.js';
import { OaImport } from './oa-import.js';
import { OaModel } from './oa-model.js';
import { HTTP_METHODS, OaOperation } from './oa-operation.js';
import { OaService } from './oa-service.js';
import { Options } from './options.js';
import { Templates } from './templates.js';
import { fileWrite, resolveFromIMU, syncDirs } from './utils/file-system.js';
import { methodName, refName, trimTrailingSlash } from './utils/string.js';

export class Generator {
    protected globals: Globals;
    protected hbProvider: HbProvider;
    protected templates: Templates;
    protected imports = new Map<string, OaImport>();
    protected models = new Map<string, OaModel>();
    protected services = new Map<string, OaService>();
    protected operationsByTag = new Map<string, OaOperation[]>();
    protected operations = new Map<string, OaOperation>();
    protected outDir: string;
    protected tempDir: string;

    constructor(public openApi: OpenAPIObject, public options: Options) {
        this.outDir = trimTrailingSlash(options.output);
        this.tempDir = this.outDir + '$';
    }

    public async generate(): Promise<void> {
        await this.collectTemplates();
        this.collectModels();
        this.collectOperations(); // First read all operations, as tags are by operation
        this.collectServices(); // Then create a service per operation, as long as the tag is included
        if (this.options.ignoreUnusedModels !== false) {
            this.ignoreUnusedModels();
        }

        // Make sure the temporary directory is empty before starting
        fse.removeSync(this.tempDir);
        fse.ensureDirSync(this.tempDir);

        try {
            // Generate each model
            const models = Array.from(this.models.values());
            for (const model of models) {
                this.write('model', model, model.fileName, this.options.modelsDir);
            }

            // Generate each service
            const services = Array.from(this.services.values());
            for (const service of services) {
                this.write('service', service, service.fileName, this.options.servicesDir);
            }

            // Context objects passed to general templates
            const general = { services, models };
            const modelImports =
                this.globals.modelIndexFile || this.options.indexFile
                    ? models.map((model) => new OaImport().fromModel(model))
                    : null;

            // Generate the general files
            this.write('configuration', general, this.globals.configurationFile);
            this.write('requestBuilder', general, this.globals.requestBuilderFile);
            if (this.globals.moduleClass && this.globals.moduleFile) {
                this.write('module', general, this.globals.moduleFile);
            }
            if (this.globals.serviceIndexFile) {
                this.write('serviceIndex', general, this.globals.serviceIndexFile);
            }
            if (this.globals.modelIndexFile) {
                this.write('modelIndex', { ...general, modelImports }, this.globals.modelIndexFile);
            }
            if (this.options.indexFile) {
                this.write('index', { ...general, modelImports }, 'index');
            }

            // Now synchronize the temp to the output folder
            syncDirs(this.tempDir, this.outDir, this.options.removeStaleFiles, this.options.verbose);

            console.info(
                `Generated ${models.length} models and ${services.length} services from ${this.options.input}.`,
            );
        } finally {
            // Always remove the temporary directory
            fse.removeSync(this.tempDir);
        }
    }

    protected write(template: string, model: object | null | undefined, baseName: string, subDir?: string) {
        const tsContent = this.templates.apply(template, model);
        const filePath = join(this.tempDir, subDir || '.', `${baseName}.ts`);
        fse.ensureDirSync(dirname(filePath));
        fileWrite(filePath, tsContent);
    }

    protected async collectTemplates(): Promise<void> {
        this.globals = new Globals(this.options);

        this.hbProvider = new HbProvider();
        await this.hbProvider.loadCustomHelpers(this.options.templates);

        const builtInDir = resolveFromIMU(import.meta.url, '../templates');
        const customDir = this.options.templates ? resolve(this.options.templates) : '';
        this.templates = new Templates(builtInDir, customDir, this.globals, this.hbProvider.instance);
    }

    protected collectModels(): void {
        const schemas = (this.openApi.components || {}).schemas || {};
        for (const [name, schema] of Object.entries(schemas)) {
            this.models.set(name, new OaModel(this.openApi, schema, name, this.options));
        }
        this.shortenModels();
        for (const [refName, model] of this.models.entries()) {
            this.imports.set(refName, new OaImport().fromModel(model));
        }
        for (const model of this.models.values()) {
            model.collectImports(this.imports);
        }
    }

    protected collectOperations(): void {
        for (const [opPath, pathSpec] of Object.entries(this.openApi.paths)) {
            for (const method of HTTP_METHODS) {
                const methodSpec: OperationObject | undefined = pathSpec[method];
                if (!methodSpec) {
                    continue;
                }

                let id = methodSpec.operationId;
                id = id ? methodName(id) : methodName(`${opPath}.${method}`);

                if (this.operations.has(id)) {
                    // Duplicated id. Add a suffix
                    let suffix = 0;
                    let tryId = id;
                    while (this.operations.has(tryId)) {
                        tryId = `${id}_${++suffix}`;
                    }
                    console.warn(
                        `Duplicate operation id '${id}'. Assuming id ${tryId} for operation '${opPath}.${method}'.`,
                    );
                    id = tryId;
                }

                const operation = new OaOperation(this.openApi, opPath, pathSpec, method, id, methodSpec, this.options);
                // Set a default tag if no tags are found
                if (operation.tags.length === 0) {
                    console.warn(
                        `No tags set on operation '${opPath}.${method}'. Assuming '${this.options.defaultTag}'.`,
                    );
                    operation.tags.push(this.options.defaultTag);
                }
                for (const tag of operation.tags) {
                    let operations = this.operationsByTag.get(tag);
                    if (!operations) {
                        operations = [];
                        this.operationsByTag.set(tag, operations);
                    }
                    operations.push(operation);
                }

                this.operations.set(id, operation);
            }
        }
    }

    protected collectServices(): void {
        const tags = this.openApi.tags || [];
        for (const [tagName, operations] of this.operationsByTag.entries()) {
            if (this.options.includeTags.length > 0 && !this.options.includeTags.includes(tagName)) {
                this.options.verbose &&
                    console.debug(`Ignoring tag ${tagName} because it is not listed in the 'includeTags' option.`);
                continue;
            }
            if (this.options.excludeTags.length > 0 && this.options.excludeTags.includes(tagName)) {
                this.options.verbose &&
                    console.debug(`Ignoring tag ${tagName} because it is listed in the 'excludeTags' option.`);
                continue;
            }
            const tag = tags.find((t) => t.name === tagName) || { name: tagName };
            const service = new OaService(tag, operations || [], this.options);
            service.collectImports(this.imports);
            this.services.set(tag.name, service);
        }
    }

    protected ignoreUnusedModels(): void {
        // First, collect all type names used by services
        const usedNames = new Set<string>();
        for (const service of this.services.values()) {
            for (const imp of service.imports) {
                usedNames.add(imp.refName);
            }
            for (const imp of service.additionalDependencies) {
                usedNames.add(imp);
            }
        }

        // Collect dependencies on models themselves
        const referencedModels = Array.from(usedNames);
        usedNames.clear();
        for (const name of referencedModels) {
            this.collectDependencies(name, usedNames);
        }

        // Then delete all unused models
        for (const model of this.models.values()) {
            if (!usedNames.has(model.name)) {
                this.options.verbose && console.debug(`Ignoring model ${model.name} because it is not used anywhere.`);
                this.models.delete(model.name);
            }
        }
    }

    protected collectDependencies(name: string, usedNames: Set<string>): void {
        const model = this.models.get(name);
        if (!model || usedNames.has(model.name)) {
            return;
        }
        // Add the model name itself
        usedNames.add(model.name);
        // Then find all referenced names and recurse
        for (const refName of this.allReferencedNames(model.schema)) {
            this.collectDependencies(refName, usedNames);
        }
    }

    protected allReferencedNames(schema: SchemaObject | ReferenceObject | undefined): string[] {
        if (!schema) {
            return [];
        }

        if (schema.$ref) {
            return [refName(schema.$ref)];
        }

        const result: string[] = [];
        schema = schema as SchemaObject;
        for (const sch of schema.allOf || []) {
            result.push(...this.allReferencedNames(sch));
        }
        for (const sch of schema.anyOf || []) {
            result.push(...this.allReferencedNames(sch));
        }
        for (const sch of schema.oneOf || []) {
            result.push(...this.allReferencedNames(sch));
        }
        if (schema.properties) {
            for (const prop of Object.values(schema.properties)) {
                result.push(...this.allReferencedNames(prop));
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            result.push(...this.allReferencedNames(schema.additionalProperties));
        }
        if (schema.items) {
            result.push(...this.allReferencedNames(schema.items));
        }
        return result;
    }

    protected shortenModels(): void {
        const typeNamesCount = new Map<string, Set<string>>();
        for (const [refName, model] of this.models.entries()) {
            const occurrences = typeNamesCount.get(model.typeName) || new Set<string>();
            occurrences.add(refName);
            typeNamesCount.set(model.typeName, occurrences);
        }
        for (const model of this.models.values()) {
            if (typeNamesCount.get(model.typeName).size === 1) {
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
}
