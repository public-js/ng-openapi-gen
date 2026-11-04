import { MediaTypeObject, OpenAPIObject } from 'openapi3-ts';

import { Options } from '../../config/options.js';
import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';

export class OaContent {
    public type: string;

    constructor(
        public mediaType: string,
        public spec: MediaTypeObject,
        public openApi: OpenAPIObject,
        public options: Options,
    ) {}

    public updateProperties(context: TypeContext): void {
        this.type = tsTypeVal(this.spec.schema, context);
    }
}
