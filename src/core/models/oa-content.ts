import { MediaTypeObject } from 'openapi3-ts';

import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';

export class OaContent {
    public type = '';

    constructor(
        public mediaType: string,
        public spec: MediaTypeObject,
    ) {}

    public updateProperties(context: TypeContext): void {
        this.type = tsTypeVal(this.spec.schema, context);
    }
}
