import { OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts';

import { Options } from './options.js';
import { tsType } from './utils/open-api.js';
import { methodName, tsComments } from './utils/string.js';

export class OaSecurity {
    /** Variable name */
    public var: string;
    /** Header name */
    public name: string;
    public tsComments: string;
    /** Location of security parameter */
    public in: string;
    public type: string;

    constructor(
        key: string,
        public spec: SecuritySchemeObject,
        public scope: string[] = [],
        options: Options,
        openApi: OpenAPIObject,
    ) {
        this.name = spec.name || '';
        this.var = methodName(key);
        this.tsComments = tsComments(spec.description || '', 2);
        this.in = spec.in || 'header';
        this.type = tsType(spec.schema, options, openApi);
    }
}
