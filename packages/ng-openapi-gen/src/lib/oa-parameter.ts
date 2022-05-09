import { OpenAPIObject, ParameterLocation, ParameterObject } from 'openapi3-ts';

import { OaImport } from './oa-import.js';
import { Options } from './options.js';
import { tsTypeVal } from './utils/open-api.js';
import { escapeId, tsComments } from './utils/string.js';

export class OaParameter {
    public var: string;
    public varAccess: string;
    public name: string;
    public tsComments: string;
    public required: boolean;
    public in: ParameterLocation;
    public type: string;
    public style?: string;
    public explode?: boolean;
    public parameterOptions: string;

    constructor(public spec: ParameterObject) {
        this.name = spec.name;
        this.var = escapeId(this.name);
        this.varAccess = this.var.includes("'") ? `[${this.var}]` : `.${this.var}`;
        this.tsComments = tsComments(spec.description || '', 2, spec.deprecated);
        this.in = spec.in || 'query';
        this.required = this.in === 'path' || spec.required || false;
        this.style = spec.style;
        this.explode = spec.explode;
        this.parameterOptions = this.createParameterOptions();
    }

    public updateProperties(openApi: OpenAPIObject, options: Options, imports: Map<string, OaImport>): void {
        this.type = tsTypeVal(this.spec.schema, openApi, options, imports);
    }

    protected createParameterOptions(): string {
        const options: { style?: string; explode?: boolean } = {};
        if (this.style) {
            options.style = this.style;
        }
        if (!!this.explode === this.explode) {
            options.explode = this.explode;
        }
        return JSON.stringify(options);
    }
}
