import { ParameterLocation, ParameterObject } from 'openapi3-ts';

import { escapeId, tsComments } from '../../utils/string.js';
import { tsTypeVal, type TypeContext } from '../generation/ts-type.js';

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

    public updateProperties(context: TypeContext): void {
        this.type = tsTypeVal(this.spec.schema, context);
    }

    protected createParameterOptions(): string {
        const { style, explode } = this;
        return JSON.stringify({ ...(style && { style }), ...(typeof explode === 'boolean' && { explode }) });
    }
}
