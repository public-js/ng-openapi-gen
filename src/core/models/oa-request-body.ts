import type { RequestBodyObject } from 'openapi3-ts/oas31';

import { docText } from '../../utils/string.js';
import { OaContent } from './oa-content.js';

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
