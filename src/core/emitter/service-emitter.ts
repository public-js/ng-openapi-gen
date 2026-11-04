import {
    MethodDeclarationStructure,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    StructureKind,
    VariableDeclarationKind,
    type SourceFile,
} from 'ts-morph';

import type { GeneratorDocument } from '../generation/document.js';
import type { OaOperationVariant } from '../models/oa-operation-variant.js';
import type { OaService } from '../models/oa-service.js';
import { namedSpecifier, toDocs } from './source-file-helpers.js';

export function buildServiceSourceFile(sourceFile: SourceFile, service: OaService, document: GeneratorDocument): void {
    sourceFile.addStatements(document.globals.autoGenerationNotice);
    const useInjectFunction = document.options.injectionStyle === 'inject';

    sourceFile.addImportDeclarations([
        { moduleSpecifier: '@angular/common/http', namedImports: ['HttpClient', 'HttpContext', 'HttpResponse'] },
        {
            moduleSpecifier: '@angular/core',
            namedImports: useInjectFunction ? ['inject', 'Injectable'] : ['Inject', 'Injectable'],
        },
        { moduleSpecifier: 'rxjs', namedImports: ['Observable'] },
        { moduleSpecifier: 'rxjs/operators', namedImports: ['filter', 'map'] },
        {
            moduleSpecifier: `${service.pathToRoot}${document.globals.configurationFile}`,
            namedImports: [document.globals.rootUrlToken],
        },
        {
            moduleSpecifier: `${service.pathToRoot}${document.globals.requestBuilderFile}`,
            namedImports: [document.globals.requestBuilderClass, document.globals.responseClass],
        },
        ...service.imports.map((imp) => ({ moduleSpecifier: imp.file, namedImports: [namedSpecifier(imp)] })),
    ]);

    sourceFile.addClass({
        isExported: true,
        name: service.typeName,
        docs: toDocs(service.docs),
        decorators: [
            {
                name: 'Injectable',
                arguments: document.globals.moduleClass ? [] : ["{ providedIn: 'root' }"],
            },
        ],
        ctors: useInjectFunction
            ? []
            : [
                  {
                      parameters: [
                          {
                              name: 'rootUrl',
                              type: 'string',
                              scope: Scope.Private,
                              decorators: [{ name: 'Inject', arguments: [document.globals.rootUrlToken] }],
                          },
                          {
                              name: 'http',
                              type: 'HttpClient',
                              scope: Scope.Private,
                              decorators: [{ name: 'Inject', arguments: ['HttpClient'] }],
                          },
                      ],
                  },
              ],
        properties: [
            ...(useInjectFunction
                ? [
                      {
                          name: 'rootUrl',
                          type: 'string',
                          scope: Scope.Private,
                          initializer: `inject(${document.globals.rootUrlToken})`,
                      },
                      {
                          name: 'http',
                          type: 'HttpClient',
                          scope: Scope.Private,
                          initializer: 'inject(HttpClient)',
                      },
                  ]
                : []),
            ...service.operations.map((operation) => ({
                name: operation.pathVar,
                isReadonly: true,
                isStatic: true,
                scope: Scope.Private,
                initializer: `'${operation.path}'`,
                docs: [`Path part for operation \`${operation.id}\``],
            })),
        ],
        methods: service.operations.flatMap((operation) =>
            operation.variants.flatMap((variant) =>
                variant.generateResponseMethod
                    ? [buildResponseMethod(service, variant, document), buildBodyMethod(service, variant, document)]
                    : [buildBodyMethod(service, variant, document)],
            ),
        ),
    });
}

function buildResponseMethod(
    service: OaService,
    variant: OaOperationVariant,
    document: GeneratorDocument,
): OptionalKind<MethodDeclarationStructure> {
    return {
        name: variant.responseMethodName,
        scope: Scope.Public,
        docs: toDocs(variant.responseMethodDocs),
        returnType: `Observable<${document.globals.responseClass}<${variant.resultType}>>`,
        parameters: buildParameters(variant),
        statements: buildRequestStatements(service, variant, document),
    };
}

function buildBodyMethod(
    service: OaService,
    variant: OaOperationVariant,
    document: GeneratorDocument,
): OptionalKind<MethodDeclarationStructure> {
    const { responseClass } = document.globals;
    const toBody = `map((r: ${responseClass}<${variant.resultType}>) => r.body as ${variant.resultType}),`;
    return {
        name: variant.methodName,
        scope: Scope.Public,
        docs: toDocs(variant.bodyMethodDocs),
        returnType: `Observable<${variant.resultType}>`,
        parameters: buildParameters(variant),
        statements: variant.generateResponseMethod
            ? [
                  (writer) => {
                      writer.writeLine(`return this.${variant.responseMethodName}(params, context).pipe(`);
                      writer.writeLine(`  ${toBody}`);
                      writer.write(');');
                  },
              ]
            : buildRequestStatements(service, variant, document, toBody),
    };
}

function buildParameters(variant: OaOperationVariant): OptionalKind<ParameterDeclarationStructure>[] {
    return [
        {
            name: 'params',
            hasQuestionToken: !variant.operation.parametersRequired,
            type: buildOperationParametersType(variant),
        },
        { name: 'context', hasQuestionToken: true, type: 'HttpContext' },
    ];
}

/** Statements that build and send the request. `toBody` is an extra pipe step that unwraps the response body. */
function buildRequestStatements(
    service: OaService,
    variant: OaOperationVariant,
    document: GeneratorDocument,
    toBody?: string,
): MethodDeclarationStructure['statements'] {
    const { operation } = variant;
    const { requestBuilderClass, responseClass } = document.globals;
    return [
        {
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: 'rb',
                    initializer: `new ${requestBuilderClass}(this.rootUrl, ${service.typeName}.${operation.pathVar}, '${operation.method}')`,
                },
            ],
        },
        (writer) => {
            writer.writeLine('if (params) {');
            for (const parameter of operation.parameters) {
                writer.writeLine(
                    `  rb.${parameter.in}('${parameter.name}', params${parameter.varAccess}, ${parameter.parameterOptions});`,
                );
            }
            if (variant.requestBody) {
                writer.writeLine(`  rb.body(params.body, '${variant.requestBody.mediaType}');`);
            }
            writer.writeLine('}');
        },
        (writer) => {
            writer.writeLine('return this.http.request(');
            writer.writeLine(
                `  rb.build({ responseType: '${variant.responseType}', accept: '${variant.accept}', context: context })`,
            );
            writer.writeLine(').pipe(');
            writer.writeLine('  filter((r: any) => r instanceof HttpResponse),');
            writer.writeLine(`  map((r: HttpResponse<any>) => ${renderHandleResponse(variant, responseClass)}),`);
            if (toBody) {
                writer.writeLine(`  ${toBody}`);
            }
            writer.write(');');
        },
    ];
}

function buildOperationParametersType(variant: OaOperationVariant): string {
    const lines = ['{'];
    for (const parameter of variant.operation.parameters) {
        if (parameter.docs) {
            lines.push(toInlineDoc(parameter.docs));
        }
        lines.push(`  ${parameter.var}${parameter.required ? '' : '?'}: ${parameter.type};`);
    }
    if (variant.requestBody) {
        const body = variant.operation.requestBody;
        if (body?.docs) {
            lines.push(toInlineDoc(body.docs));
        }
        lines.push(`  body${body?.required ? '' : '?'}: ${variant.requestBody.type};`);
    }
    lines.push('}');
    return lines.join('\n');
}

function renderHandleResponse(variant: OaOperationVariant, responseClass: string): string {
    const response = '(r as HttpResponse<any>)';
    const cast = `as ${responseClass}<${variant.resultType}>`;
    if (variant.isVoid) {
        return `${response}.clone({ body: undefined }) ${cast}`;
    }
    if (variant.isNumber) {
        return `${response}.clone({ body: parseFloat(String(${response}.body)) }) ${cast}`;
    }
    if (variant.isBoolean) {
        return `${response}.clone({ body: String(${response}.body) === 'true' }) ${cast}`;
    }
    return `r ${cast}`;
}

function toInlineDoc(text: string): string {
    return ['  /**', ...text.split('\n').map((line) => `   * ${line}`), '   */'].join('\n');
}
