import { MediaTypeObject, OpenAPIObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { Options } from './options.js';
import { tsTypeVal } from './utils/open-api.js';

export class OaContent {
    public type: string;

    constructor(
        public mediaType: string,
        public spec: MediaTypeObject,
        public openApi: OpenAPIObject,
        public options: Options,
    ) {}

    public updateProperties(imports: Map<string, OaImport>): void {
        this.type = tsTypeVal(this.spec.schema, this.openApi, this.options, imports);
    }
}
