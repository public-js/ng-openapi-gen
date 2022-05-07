import { ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { OaImports } from './oa-imports.js';
import { Options } from './options.js';
import { fileName, namespace, simpleName, typeName } from './utils/string.js';

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

    public imports: OaImport[];
    private _imports: OaImports;

    public additionalDependencies: string[];
    private _additionalDependencies = new Set<string>();

    protected constructor(
        public name: string, // oaName
        public options: Options,
        typeNameTransform: (oaName: string, options: Options) => string,
    ) {
        this.typeName = typeNameTransform(name, options);
        this.namespace = namespace(name);

        if (this.namespace) {
            this.fileName = this.namespace + '/' + fileName(this.typeName);
            this.qualifiedName = typeName(this.namespace) + this.typeName;
        } else {
            this.fileName = fileName(this.typeName);
            this.qualifiedName = this.typeName;
        }

        this._imports = new OaImports(options);
    }

    protected abstract skipImport(name: string): boolean;

    /**
     * Must be implemented to return the relative path to the models, ending with `/`
     */
    protected abstract pathToModels(): string;

    protected addImport(name: string): void {
        if (!this.skipImport(name)) {
            // Don't have to import to this own file
            this._imports.add(name, this.pathToModels());
        }
    }

    protected collectImports(
        schema: SchemaObject | ReferenceObject | undefined,
        additional = false,
        processOneOf = false,
    ): void {
        if (!schema) {
            return;
        }

        if (schema.$ref) {
            const dep = simpleName(schema.$ref);
            if (additional) {
                this._additionalDependencies.add(dep);
            } else {
                this.addImport(dep);
            }
            return;
        }

        schema = schema as SchemaObject;
        for (const imp of schema.oneOf || []) {
            this.collectImports(imp, additional);
        }
        for (const imp of schema.allOf || []) {
            this.collectImports(imp, additional);
        }
        for (const imp of schema.anyOf || []) {
            this.collectImports(imp, additional);
        }
        if (processOneOf) {
            for (const imp of schema.oneOf || []) {
                this.collectImports(imp, additional);
            }
        }
        if (schema.items) {
            this.collectImports(schema.items, additional);
        }
        if (schema.properties) {
            for (const prop of Object.values(schema.properties)) {
                this.collectImports(prop, additional, true);
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            this.collectImports(schema.additionalProperties, additional);
        }
    }

    protected updateImports(): void {
        this.imports = this._imports.toArray();
        this.additionalDependencies = [...this._additionalDependencies];
    }
}
