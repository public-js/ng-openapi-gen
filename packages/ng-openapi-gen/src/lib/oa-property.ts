import { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { OaModel } from './oa-model.js';
import { Options } from './options.js';
import { tsTypeVal } from './utils/open-api.js';
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
        openApi: OpenAPIObject,
        options: Options,
        imports: Map<string, OaImport>,
    ) {
        this.identifier = escapeId(this.name);

        this.type = tsTypeVal(this.schema, openApi, options, imports, model);
        if ((schema as SchemaObject)?.nullable && !this.type.startsWith('null | ')) {
            this.type = 'null | ' + this.type;
        }

        const description = (schema as SchemaObject).description || '';
        this.tsComments = tsComments(description, 1, (schema as SchemaObject).deprecated);
    }
}
