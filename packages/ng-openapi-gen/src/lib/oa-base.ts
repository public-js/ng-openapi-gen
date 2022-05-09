import { ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { Options } from './options.js';
import { fileName, namespace, refName, typeName } from './utils/string.js';

export abstract class OaBase {
    /** Name of the generated type / class */
    public typeName: string;
    /** Namespace, separated by '/' */
    public namespace?: string;
    /** Name of the generated file */
    public fileName: string;
    /** Camel-case qualified name of the type, including namespace */
    public qualifiedName: string;
    /** TypeScript comments for this type */
    public tsComments: string;
    /** Relative path to modelsDir, ending with `/` */
    public pathToModels: string;

    public imports: OaImport[];
    protected _imports = new Map<string, OaImport>();

    public additionalDependencies: string[];
    private _additionalDependencies = new Set<string>();

    protected constructor(
        public readonly refName: string,
        public readonly options: Options,
        typeNameTransform: (oaName: string, options: Options) => string,
    ) {
        this.typeName = typeNameTransform(refName, options);
        this.namespace = namespace(refName);

        if (this.namespace) {
            this.fileName = this.namespace + '/' + fileName(this.typeName);
            this.qualifiedName = typeName(this.namespace) + this.typeName;
        } else {
            this.fileName = fileName(this.typeName);
            this.qualifiedName = this.typeName;
        }
    }

    public get name(): string {
        return this.refName;
    }

    public abstract collectImports(imports: Map<string, OaImport>): void;

    protected abstract skipImport(refName: string): boolean;

    protected addImport(refName: string, imports: Map<string, OaImport>): void {
        // Prevent self imports
        if (!this.skipImport(refName)) {
            const existingImport = imports.get(refName);
            this._imports.set(
                refName,
                existingImport
                    ? new OaImport().fromImport(existingImport)
                    : new OaImport().fromRef(this.options, refName),
            );
        }
    }

    protected createImports(
        schema: SchemaObject | ReferenceObject | undefined,
        imports: Map<string, OaImport>,
        additional = false,
        processOneOf = false,
    ): void {
        if (!schema) {
            return;
        }

        if (schema.$ref) {
            const dep = refName(schema.$ref);
            if (additional) {
                this._additionalDependencies.add(dep);
            } else {
                this.addImport(dep, imports);
            }
            return;
        }

        schema = schema as SchemaObject;
        for (const imp of schema.oneOf || []) {
            this.createImports(imp, imports, additional);
        }
        for (const imp of schema.allOf || []) {
            this.createImports(imp, imports, additional);
        }
        for (const imp of schema.anyOf || []) {
            this.createImports(imp, imports, additional);
        }
        if (processOneOf) {
            for (const imp of schema.oneOf || []) {
                this.createImports(imp, imports, additional);
            }
        }
        if (schema.items) {
            this.createImports(schema.items, imports, additional);
        }
        if (schema.properties) {
            for (const prop of Object.values(schema.properties)) {
                this.createImports(prop, imports, additional, true);
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            this.createImports(schema.additionalProperties, imports, additional);
        }
    }

    protected updateImports(): void {
        const typeNamesCount = new Map<string, number>([[this.typeName, 1]]);
        for (const imp of this._imports.values()) {
            typeNamesCount.set(imp.typeName, (typeNamesCount.get(imp.typeName) || 0) + 1);
        }

        const namespaceSplit = (this.namespace || '').split('/').filter(Boolean);
        for (const imp of this._imports.values()) {
            imp.file = imp.getRelativePath(namespaceSplit, this.pathToModels);

            if (typeNamesCount.get(imp.typeName) > 1) {
                imp.useAlias = true;
            }
        }
        this.imports = Array.from(this._imports.keys())
            .sort()
            .map((key: string) => this._imports.get(key));

        this.additionalDependencies = [...this._additionalDependencies];
    }
}
