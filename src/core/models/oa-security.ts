import { SecuritySchemeObject } from 'openapi3-ts';

import { methodName, tsComments } from '../../utils/string.js';
import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';

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

    public updateProperties(context: TypeContext): void {
        this.type = tsTypeVal(this.spec.schema, context);
    }
}
