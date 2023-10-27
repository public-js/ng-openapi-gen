import { TagObject } from 'openapi3-ts';

import { OaBase } from './oa-base.js';
import { OaImport } from './oa-import.js';
import { OaOperation } from './oa-operation.js';
import { Options } from './options.js';
import { serviceClass } from './utils/open-api.js';
import { tsComments } from './utils/string.js';

export class OaService extends OaBase {
    constructor(
        tag: TagObject,
        public readonly operations: OaOperation[],
        options: Options,
    ) {
        super(tag.name, options, serviceClass);

        this.fileName = this.fileName.replace(/-service$/, '.service');
        this.tsComments = tsComments(tag.description || '', 0);
        this.pathToModels = `../${options.modelsDir}/`;
    }

    public collectImports(imports: Map<string, OaImport>): void {
        for (const operation of this.operations) {
            for (const parameter of operation.parameters) {
                this.createImports(parameter.spec.schema, imports, false, true);
            }
            for (const securityGroup of operation.security) {
                for (const security of securityGroup) {
                    this.createImports(security.spec.schema, imports);
                }
            }
            if (operation.requestBody) {
                for (const content of operation.requestBody.content) {
                    this.createImports(content.spec.schema, imports);
                }
            }
            for (const response of operation.allResponses) {
                const additional = response !== operation.successResponse;
                for (const content of response.content) {
                    this.createImports(content.spec.schema, imports, additional, true);
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
