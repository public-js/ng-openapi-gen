import { RequestBodyObject } from 'openapi3-ts';

import { OaContent } from './oa-content.js';
import { Options } from './options.js';
import { tsComments } from './utils/string.js';

export class OaRequestBody {
    public required: boolean;
    public tsComments: string;

    constructor(
        public spec: RequestBodyObject,
        public content: OaContent[],
        public options: Options,
    ) {
        this.required = spec.required === true;
        this.tsComments = tsComments(spec.description, 2);
    }
}
