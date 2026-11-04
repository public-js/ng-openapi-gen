import { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

import { docText, escapeId } from '../../utils/string.js';
import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';
import { OaModel } from './oa-model.js';

export class OaProperty {
    public identifier: string;
    public type: string;
    public docs: string;

    constructor(
        public model: OaModel,
        public name: string,
        public schema: SchemaObject | ReferenceObject,
        public required: boolean,
        context: TypeContext,
    ) {
        this.identifier = escapeId(this.name);

        this.type = tsTypeVal(this.schema, { ...context, container: model });

        this.docs = docText((schema as SchemaObject).description, (schema as SchemaObject).deprecated);
    }
}
