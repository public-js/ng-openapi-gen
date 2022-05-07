import { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaModel } from './oa-model.js';
import { Options } from './options.js';
import { tsType } from './utils/open-api.js';
import { escapeId, tsComments } from './utils/string.js';

export class OaProperty {
    public identifier: string;
    public type: string;
    public tsComments: string;

    constructor(
        public model: OaModel,
        public name: string,
        public schema: SchemaObject | ReferenceObject,
        public required: boolean,
        options: Options,
        openApi: OpenAPIObject,
    ) {
        this.identifier = escapeId(this.name);

        this.type = tsType(this.schema, options, openApi, model);
        if ((schema as SchemaObject)?.nullable && !this.type.startsWith('null | ')) {
            this.type = 'null | ' + this.type;
        }

        const description = (schema as SchemaObject).description || '';
        this.tsComments = tsComments(description, 1, (schema as SchemaObject).deprecated);
    }
}
