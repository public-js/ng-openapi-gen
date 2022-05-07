import { MediaTypeObject, OpenAPIObject } from 'openapi3-ts';

import { Options } from './options.js';
import { tsType } from './utils/open-api.js';

export class OaContent {
    public type: string;

    constructor(
        public mediaType: string,
        public spec: MediaTypeObject,
        public options: Options,
        public openApi: OpenAPIObject,
    ) {
        this.type = tsType(spec.schema, options, openApi);
    }
}
