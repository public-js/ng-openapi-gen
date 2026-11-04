import { SchemaObject } from 'openapi3-ts';

import { resolveRef } from '../../utils/open-api.js';
import { docText } from '../../utils/string.js';
import { OaContent } from './oa-content.js';
import { OaOperation } from './oa-operation.js';

export class OaOperationVariant {
    public responseMethodName: string;
    public resultType: string;
    public responseType: string;
    public accept: string;

    public responseMethodDocs: string;
    public bodyMethodDocs: string;
    public generateResponseMethod: boolean;

    constructor(
        public operation: OaOperation,
        public methodName: string,
        public requestBody: OaContent | null,
        public successResponse: OaContent | null,
    ) {
        this.generateResponseMethod = operation.generateResponseMethod;
        this.responseMethodName = `${methodName}$Response`;

        if (successResponse) {
            this.resultType = successResponse.type;
            this.responseType = this.inferResponseType(successResponse);
            this.accept = successResponse.mediaType;
        } else {
            this.resultType = 'void';
            this.responseType = 'text';
            this.accept = '*/*';
        }

        this.responseMethodDocs = docText(
            `${this.descriptionPrefix}This method provides access to the full \`HttpResponse\`, allowing access to response headers.\nTo access only the response body, use \`${this.methodName}()\` instead.${this.descriptionSuffix}`,
            operation.deprecated,
        );
        this.bodyMethodDocs = docText(
            `${this.descriptionPrefix}This method provides access only to the response body.${this.descriptionSuffix}`,
            operation.deprecated,
        );
    }

    public get isVoid(): boolean {
        return this.resultType === 'void';
    }

    public get isNumber(): boolean {
        return this.resultType === 'number';
    }

    public get isBoolean(): boolean {
        return this.resultType === 'boolean';
    }

    protected inferResponseType(successResponse: OaContent): string {
        // If the schema is in binary format, return 'blob'
        let schemaOrRef = successResponse.spec?.schema || { type: 'string' };
        if (schemaOrRef.$ref) {
            schemaOrRef = resolveRef(this.operation.openApi, schemaOrRef.$ref) as SchemaObject;
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

    private get descriptionSuffix(): string {
        const sends = this.requestBody ? 'sends `' + this.requestBody.mediaType + '` and ' : '';
        const handles = this.requestBody
            ? `handles the request body of type \`${this.requestBody.mediaType}\``
            : "doesn't expect any request body";
        return `\n\nThis method ${sends}${handles}.`;
    }
}
