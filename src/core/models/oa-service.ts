import { posix } from 'node:path';

import { TagObject } from 'openapi3-ts';

import { Options } from '../../config/options.js';
import { serviceClass } from '../../utils/open-api.js';
import { docText } from '../../utils/string.js';
import { OaBase } from './oa-base.js';
import { OaImport } from './oa-import.js';
import { OaOperation } from './oa-operation.js';

export class OaService extends OaBase {
    constructor(
        tag: TagObject,
        public readonly operations: OaOperation[],
        options: Options,
    ) {
        super(tag.name, options, serviceClass);

        this.fileName = this.fileName.replace(/-service$/, '.service');
        this.docs = docText(tag.description);
    }

    public get sourceDir(): string {
        return posix.join(this.options.servicesDir, this.namespace ?? '');
    }

    /** Relative path to the output root, ending with `/` */
    public get pathToRoot(): string {
        return `${posix.relative(this.sourceDir, '.')}/`;
    }

    public collectImports(imports: Map<string, OaImport>): void {
        for (const operation of this.operations) {
            for (const parameter of operation.parameters) {
                this.createImports(parameter.spec.schema, imports);
            }
            if (operation.requestBody) {
                for (const content of operation.requestBody.content) {
                    this.createImports(content.spec.schema, imports);
                }
            }
            for (const response of operation.allResponses) {
                const additional = response !== operation.successResponse;
                for (const content of response.content) {
                    this.createImports(content.spec.schema, imports, additional);
                }
            }
        }
        this.updateImports();

        for (const operation of this.operations) {
            operation.updateProperties(this._imports);
        }
    }

    protected skipImport(): boolean {
        return false; // All models are imported
    }
}
