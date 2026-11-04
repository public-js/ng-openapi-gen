import { RequestBodyObject } from 'openapi3-ts';

import { OaContent } from './oa-content.js';
import { docText } from '../../utils/string.js';

export class OaRequestBody {
    public required: boolean;
    public docs: string;

    constructor(
        public spec: RequestBodyObject,
        public content: OaContent[],
    ) {
        this.required = spec.required === true;
        this.docs = docText(spec.description);
    }
}
