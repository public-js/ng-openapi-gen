import { TagObject } from 'openapi3-ts';

import { OaBase } from './oa-base.js';
import { OaOperation } from './oa-operation.js';
import { Options } from './options.js';
import { serviceClass } from './utils/open-api.js';
import { tsComments } from './utils/string.js';

export class OaService extends OaBase {
    public tag: TagObject;

    constructor(tag: TagObject, public operations: OaOperation[], options: Options) {
        super(tag.name, options, serviceClass);

        this.fileName = this.fileName.replace(/-service$/, '.service');
        this.tsComments = tsComments(tag.description || '', 0);

        // Collect the imports
        for (const operation of operations) {
            for (const parameter of operation.parameters) {
                this.collectImports(parameter.spec.schema, false, true);
            }
            for (const securityGroup of operation.security) {
                for (const security of securityGroup) this.collectImports(security.spec.schema);
            }
            if (operation.requestBody) {
                for (const content of operation.requestBody.content) {
                    this.collectImports(content.spec.schema);
                }
            }
            for (const response of operation.allResponses) {
                const additional = response !== operation.successResponse;
                for (const content of response.content) {
                    this.collectImports(content.spec.schema, additional, true);
                }
            }
        }

        this.updateImports();
    }

    protected pathToModels(): string {
        return '../models/';
    }

    protected skipImport(): boolean {
        return false; // All models are imported
    }
}
