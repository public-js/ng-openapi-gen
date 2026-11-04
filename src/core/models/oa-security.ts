import { SecuritySchemeObject } from 'openapi3-ts';

import { docText, methodName } from '../../utils/string.js';

export class OaSecurity {
    /** Variable name */
    public var: string;
    /** Header name */
    public name: string;
    public docs: string;
    /** Location of security parameter */
    public in: string;

    constructor(
        key: string,
        public spec: SecuritySchemeObject,
        public scope: string[] = [],
    ) {
        this.name = spec.name || '';
        this.var = methodName(key);
        this.docs = docText(spec.description);
        this.in = spec.in || 'header';
    }
}
