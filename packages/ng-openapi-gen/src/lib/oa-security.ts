import { OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { Options } from './options.js';
import { tsTypeVal } from './utils/open-api.js';
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
    ) {
        this.name = spec.name || '';
        this.var = methodName(key);
        this.tsComments = tsComments(spec.description || '', 2);
        this.in = spec.in || 'header';
    }

    public updateProperties(openApi: OpenAPIObject, options: Options, imports: Map<string, OaImport>): void {
        this.type = tsTypeVal(this.spec.schema, openApi, options, imports);
    }
}
