import {
    ContentObject,
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
    SecurityRequirementObject,
    SecuritySchemeObject,
} from 'openapi3-ts';

import { OaContent } from './oa-content.js';
import { OaImport } from './oa-import.js';
import { OaOperationVariant } from './oa-operation-variant.js';
import { OaParameter } from './oa-parameter.js';
import { OaRequestBody } from './oa-request-body.js';
import { OaResponse } from './oa-response.js';
import { OaSecurity } from './oa-security.js';
import { Options } from './options.js';
import { upperFirst } from './utils/lo/index.js';
import { resolveRef } from './utils/open-api.js';
import { typeName } from './utils/string.js';

export type HttpMethod = keyof Pick<
    PathItemObject,
    'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
>;
export const HTTP_METHODS: Array<HttpMethod> = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export class OaOperation {
    public tags: string[];
    public methodName: string;
    public pathVar: string;
    public parameters: OaParameter[] = [];
    public hasParameters: boolean;
    public parametersRequired = false;
    public security: OaSecurity[][] = [];
    public deprecated: boolean;

    public requestBody?: OaRequestBody;
    public successResponse?: OaResponse;
    public allResponses: OaResponse[] = [];
    public pathExpression: string;
    public variants: OaOperationVariant[] = [];

    constructor(
        public openApi: OpenAPIObject,
        public path: string,
        public pathSpec: PathItemObject,
        public method: HttpMethod,
        public id: string,
        public spec: OperationObject,
        public options: Options,
    ) {
        this.path = this.path.replace(/'/g, "\\'");
        this.tags = spec.tags || [];
        this.pathVar = `${upperFirst(id)}Path`;
        this.methodName = spec['x-operation-name'] || this.id;

        // Add both the common and specific parameters
        this.parameters = [...this.collectParameters(pathSpec.parameters), ...this.collectParameters(spec.parameters)];
        if (this.parameters.some((p) => p.required)) {
            this.parametersRequired = true;
        }
        this.hasParameters = this.parameters.length > 0;

        this.security = spec.security ? this.collectSecurity(spec.security) : this.collectSecurity(openApi.security);

        let body = spec.requestBody;
        if (body) {
            if (body.$ref) {
                body = resolveRef(this.openApi, body.$ref) as RequestBodyObject | ReferenceObject;
            }
            body = body as RequestBodyObject;
            this.requestBody = new OaRequestBody(body, this.collectContent(body.content), this.options);
            if (body.required) {
                this.parametersRequired = true;
            }
        }

        const responses = this.collectResponses();
        this.successResponse = responses.success;
        this.allResponses = responses.all;
        this.pathExpression = this.toPathExpression();

        this.deprecated = !!spec.deprecated;
    }

    public updateProperties(imports: Map<string, OaImport>): void {
        for (const parameter of this.parameters) {
            parameter.updateProperties(this.openApi, this.options, imports);
        }
        for (const securityGroup of this.security) {
            for (const security of securityGroup) {
                security.updateProperties(this.openApi, this.options, imports);
            }
        }
        if (this.requestBody) {
            for (const cnt of this.requestBody.content) {
                cnt.updateProperties(imports);
            }
        }
        if (this.successResponse) {
            for (const cnt of this.successResponse.content) {
                cnt.updateProperties(imports);
            }
        }
        for (const response of this.allResponses) {
            for (const cnt of response.content) {
                cnt.updateProperties(imports);
            }
        }
        // Calculate the variants: request body content x success response content
        this.calculateVariants();
    }

    protected collectParameters(params: (ParameterObject | ReferenceObject)[] | undefined): OaParameter[] {
        if (!params) {
            return [];
        }
        const result: OaParameter[] = [];
        for (let param of params) {
            if (param.$ref) {
                param = resolveRef(this.openApi, param.$ref) as ParameterObject;
            }
            param = param as ParameterObject;

            if (param.in === 'cookie') {
                console.warn(
                    `Ignoring cookie parameter ${this.id}.${param.name} as cookie parameters cannot be sent in XmlHttpRequests.`,
                );
            } else if (this.paramIsNotExcluded(param)) {
                result.push(new OaParameter(param as ParameterObject));
            }
        }
        return result;
    }

    protected collectSecurity(params: SecurityRequirementObject[] | undefined): OaSecurity[][] {
        if (!params) {
            return [];
        }
        const result: OaSecurity[][] = [];
        for (const param of params) {
            const scopeResult: OaSecurity[] = [];
            for (const [key, scope] of Object.entries(param)) {
                const security = resolveRef(
                    this.openApi,
                    `#/components/securitySchemes/${key}`,
                ) as SecuritySchemeObject;
                scopeResult.push(new OaSecurity(key, security, scope));
            }
            result.push(scopeResult);
        }
        return result;
    }

    protected paramIsNotExcluded(param: ParameterObject): boolean {
        const excludedParameters = this.options.excludeParameters || [];
        return !excludedParameters.includes(param.name);
    }

    protected collectContent(desc: ContentObject | undefined): OaContent[] {
        if (!desc) {
            return [];
        }
        const result: OaContent[] = [];
        for (const [type, typeSpec] of Object.entries(desc)) {
            result.push(new OaContent(type, typeSpec, this.openApi, this.options));
        }
        return result;
    }

    protected collectResponses(): { success: OaResponse | undefined; all: OaResponse[] } {
        const allResponses: OaResponse[] = [];
        const responses = this.spec.responses || {};
        const responseByType = new Map<string, OaResponse>();

        for (const [statusCode, responseObject] of Object.entries(responses)) {
            const response = this.getResponse(responseObject, statusCode);
            allResponses.push(response);
            const statusInt = parseInt(statusCode.trim(), 10);
            if (statusInt >= 200 && statusInt < 300 && !responseByType.has('successResponse')) {
                responseByType.set('successResponse', response);
            } else if (statusCode === 'default') {
                responseByType.set('defaultResponse', response);
            }
        }

        const successResponse: OaResponse | undefined =
            responseByType.get('successResponse') ?? responseByType.get('defaultResponse');
        return { success: successResponse, all: allResponses };
    }

    protected getResponse(responseObject: ResponseObject, statusCode: string): OaResponse {
        const responseDesc = responseObject.$ref
            ? (resolveRef(this.openApi, responseObject.$ref) as ResponseObject)
            : (responseObject as ResponseObject);
        return new OaResponse(
            statusCode,
            responseDesc.description || '',
            this.collectContent(responseDesc.content),
            this.options,
        );
    }

    /**
     * Returns a path expression to be evaluated, for example:
     * "/a/{var1}/b/{var2}/" returns "/a/${params.var1}/b/${params.var2}"
     */
    protected toPathExpression() {
        // eslint-disable-next-line unicorn/better-regex
        return (this.path || '').replace(/\{([^}]+)}/g, (_, pName) => {
            const param = this.parameters.find((p) => p.name === pName);
            const paramName = param ? param.var : pName;
            return '${params.' + paramName + '}';
        });
    }

    protected calculateVariants() {
        // It is possible to have multiple content types which end up in the same method.
        // For example: application/json, application/foo-bar+json, text/json ...
        const requestVariants = this.contentsByMethodPart(this.requestBody);
        const responseVariants = this.contentsByMethodPart(this.successResponse);
        for (const [requestPart, requestContent] of requestVariants.entries()) {
            for (const [responsePart, responseContent] of responseVariants.entries()) {
                const methodName = this.methodName + requestPart + responsePart;
                this.variants.push(
                    new OaOperationVariant(this, methodName, requestContent, responseContent, this.options),
                );
            }
        }
    }

    protected contentsByMethodPart(hasContent?: { content?: OaContent[] }): Map<string, OaContent | null> {
        const map = new Map<string, OaContent | null>();
        if (hasContent) {
            const content = hasContent.content;
            if (content && content.length > 0) {
                for (const type of content) {
                    if (type && type.mediaType) {
                        map.set(this.variantMethodPart(type), type);
                    }
                }
            }
        }
        if (map.size === 0) {
            map.set('', null);
        } else if (map.size === 1) {
            const content = [...map.values()][0];
            map.clear();
            map.set('', content);
        }
        return map;
    }

    /**
     * Returns how the given content is represented on the method name
     */
    protected variantMethodPart(content: OaContent | null): string {
        if (!content) {
            return '';
        }

        let type = content.mediaType.replace(/\/\*/, '');
        if (type === '*' || type === 'application/octet-stream') {
            return '$Any';
        }

        const splitType = type.split('/');
        type = splitType[splitType.length - 1];

        const plus = type.lastIndexOf('+');
        if (plus >= 0) {
            type = type.slice(plus + 1);
        }

        return this.options.skipJsonSuffix && type === 'json' ? '' : `$${typeName(type)}`;
    }
}
