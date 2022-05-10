import { SchemaObject } from 'openapi3-ts';

import { OaContent } from './oa-content.js';
import { OaOperation } from './oa-operation.js';
import { Options } from './options.js';
import { resolveRef } from './utils/open-api.js';
import { tsComments } from './utils/string.js';

export class OaOperationVariant {
    public responseMethodName: string;
    public resultType: string;
    public responseType: string;
    public accept: string;

    public isVoid: boolean;
    public isNumber: boolean;
    public isString: boolean;
    public isBoolean: boolean;
    public isOther: boolean;

    public responseMethodTsComments: string;
    public bodyMethodTsComments: string;

    constructor(
        public operation: OaOperation,
        public methodName: string,
        public requestBody: OaContent | null,
        public successResponse: OaContent | null,
        public options: Options,
    ) {
        this.responseMethodName = `${methodName}$Response`;

        if (successResponse) {
            this.resultType = successResponse.type;
            this.responseType = this.inferResponseType(
                successResponse,
                operation,
                options.customizedResponseType || {},
            );
            this.accept = successResponse.mediaType;
        } else {
            this.resultType = 'void';
            this.responseType = 'text';
            this.accept = '*/*';
        }

        this.isVoid = this.resultType === 'void';
        this.isNumber = this.resultType === 'number';
        this.isString = this.resultType === 'string';
        this.isBoolean = this.resultType === 'boolean';
        this.isOther = !this.isVoid && !this.isNumber && !this.isString && !this.isBoolean;

        this.responseMethodTsComments = tsComments(this.responseMethodDescription(), 1, operation.deprecated);
        this.bodyMethodTsComments = tsComments(this.bodyMethodDescription(), 1, operation.deprecated);
    }

    protected inferResponseType(
        successResponse: OaContent,
        operation: OaOperation,
        customizedResponseType: Options['customizedResponseType'],
    ): string {
        const customizedResponseTypeByPath = customizedResponseType[operation.path];
        if (customizedResponseTypeByPath) {
            return customizedResponseTypeByPath.toUse;
        }

        // If schema is in binary format, return 'blob'
        let schemaOrRef = successResponse.spec?.schema || { type: 'string' };
        if (schemaOrRef.$ref) {
            schemaOrRef = resolveRef(operation.openApi, schemaOrRef.$ref);
        }
        const schema = schemaOrRef as SchemaObject;
        if (schema.format === 'binary') {
            return 'blob';
        }

        const mediaType = successResponse.mediaType.toLowerCase();
        if (mediaType.includes('/json') || mediaType.includes('+json')) {
            return 'json';
        } else if (mediaType.startsWith('text/')) {
            return 'text';
        } else {
            return 'blob';
        }
    }

    private responseMethodDescription(): string {
        return this.options.responseMethodDescription.replace(
            /{{([\da-z]+)}}/gi,
            function (_, key: string) {
                return this[key];
            }.bind(this),
        );
    }

    private bodyMethodDescription(): string {
        return this.options.bodyMethodDescription.replace(
            /{{([\da-z]+)}}/gi,
            function (_, key: string) {
                return this[key];
            }.bind(this),
        );
    }

    // noinspection JSUnusedLocalSymbols
    private get descriptionPrefix(): string {
        let description = (this.operation.spec.description || '').trim();
        let summary = this.operation.spec.summary;
        if (summary) {
            if (!summary.endsWith('.')) {
                summary += '.';
            }
            description = summary + (description === '' ? '' : '\n\n') + description;
        }
        if (description !== '') {
            description += '\n\n';
        }
        return description;
    }

    // noinspection JSUnusedLocalSymbols
    private get descriptionSuffix(): string {
        const sends = this.requestBody ? 'sends `' + this.requestBody.mediaType + '` and ' : '';
        const handles = this.requestBody
            ? `handles request body of type \`${this.requestBody.mediaType}\``
            : "doesn't expect any request body";
        return `\n\nThis method ${sends}${handles}.`;
    }
}
