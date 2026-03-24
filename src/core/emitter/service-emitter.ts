import { MethodDeclarationStructure, OptionalKind, Scope, StructureKind, VariableDeclarationKind, type SourceFile } from 'ts-morph';

import type { GeneratorDocument } from '../ir/document.js';
import type { OaOperationVariant } from '../ir/legacy/oa-operation-variant.js';
import type { OaService } from '../ir/legacy/oa-service.js';
import { toDocs } from './source-file-helpers.js';

export function buildServiceSourceFile(sourceFile: SourceFile, service: OaService, document: GeneratorDocument): void {
    sourceFile.addStatements(document.globals.autoGenerationNotice);
    const useInjectFunction = document.options.injectionStyle === 'inject';

    sourceFile.addImportDeclaration({
        moduleSpecifier: '@angular/common/http',
        namedImports: ['HttpClient', 'HttpContext', 'HttpResponse'],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: '@angular/core',
        namedImports: useInjectFunction ? ['inject', 'Injectable'] : ['Inject', 'Injectable'],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: 'rxjs',
        namedImports: ['Observable'],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: 'rxjs/operators',
        namedImports: ['filter', 'map'],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: `../${document.globals.configurationFile}`,
        namedImports: [document.globals.rootUrlToken],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: `../${document.globals.requestBuilderFile}`,
        namedImports: [document.globals.requestBuilderClass, document.globals.responseClass],
    });
    for (const serviceImport of service.imports) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: serviceImport.file,
            namedImports: [
                {
                    name: serviceImport.typeName,
                    alias: serviceImport.useAlias ? serviceImport.qualifiedName : undefined,
                },
            ],
        });
    }

    sourceFile.addClass({
        isExported: true,
        name: service.typeName,
        docs: toDocs(service.tsComments),
        decorators: [
            {
                name: 'Injectable',
                arguments: document.globals.moduleClass ? [] : ['{ providedIn: \'root\' }'],
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

function buildResponseMethod(service: OaService, variant: OaOperationVariant, document: GeneratorDocument): OptionalKind<MethodDeclarationStructure> {
    return {
        name: variant.responseMethodName,
        scope: Scope.Public,
        docs: toDocs(variant.responseMethodTsComments),
        returnType: `Observable<${document.globals.responseClass}<${variant.resultType}>>`,
        parameters: [
            {
                name: 'params',
                hasQuestionToken: !variant.operation.parametersRequired,
                type: buildOperationParametersType(variant),
            },
            {
                name: 'context',
                hasQuestionToken: true,
                type: 'HttpContext',
            },
        ],
        statements: [
            {
                kind: StructureKind.VariableStatement,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: 'rb',
                        initializer: `new ${document.globals.requestBuilderClass}(this.rootUrl, ${service.typeName}.${variant.operation.pathVar}, '${variant.operation.method}')`,
                    },
                ],
            },
            (writer) => {
                writer.writeLine('if (params) {');
                for (const parameter of variant.operation.parameters) {
                    writer.writeLine(
                        `  rb.${parameter.in}('${parameter.name}', params${parameter.varAccess}, ${parameter.parameterOptions});`,
                    );
                }
                for (const line of renderRequestBodyLines(variant)) {
                    writer.writeLine(line);
                }
                writer.writeLine('}');
            },
            (writer) => {
                writer.writeLine('return this.http.request(');
                writer.writeLine(`  rb.build({ responseType: '${variant.responseType}', accept: '${variant.accept}', context: context })`);
                writer.writeLine(').pipe(');
                writer.writeLine(`  filter((r: any) => r instanceof HttpResponse),`);
                writer.writeLine(`  map((r: HttpResponse<any>) => ${renderHandleResponse(variant, document.globals.responseClass)}),`);
                writer.write(');');
            },
        ],
    };
}

function buildBodyMethod(
    service: OaService,
    variant: OaOperationVariant,
    document: GeneratorDocument,
): OptionalKind<MethodDeclarationStructure> {
    return {
        name: variant.methodName,
        scope: Scope.Public,
        docs: toDocs(variant.bodyMethodTsComments),
        returnType: `Observable<${variant.resultType}>`,
        parameters: [
            {
                name: 'params',
                hasQuestionToken: !variant.operation.parametersRequired,
                type: buildOperationParametersType(variant),
            },
            {
                name: 'context',
                hasQuestionToken: true,
                type: 'HttpContext',
            },
        ],
        statements: variant.generateResponseMethod
            ? [
                (writer) => {
                    writer.writeLine(`return this.${variant.responseMethodName}(params, context).pipe(`);
                    writer.writeLine(`  map((r: ${document.globals.responseClass}<${variant.resultType}>) => r.body as ${variant.resultType}),`);
                    writer.write(');');
                },
            ]
            : buildDirectBodyMethodStatements(service, variant),
    };
}

function buildOperationParametersType(variant: OaOperationVariant): string {
    const lines = ['{'];
    for (const parameter of variant.operation.parameters) {
        const docs = toDocs(parameter.tsComments)[0];
        if (docs) {
            lines.push(toInlineDoc(docs, 1));
        }
        lines.push(`  ${parameter.var}${parameter.required ? '' : '?'}: ${parameter.type};`);
    }
    if (variant.requestBody) {
        const body = variant.operation.requestBody;
        const docs = toDocs(body?.tsComments ?? '')[0];
        if (docs) {
            lines.push(toInlineDoc(docs, 1));
        }
        lines.push(`  body${body?.required ? '' : '?'}: ${variant.requestBody.type};`);
    }
    lines.push('}');
    return lines.join('\n');
}

function renderHandleResponse(variant: OaOperationVariant, responseClass: string): string {
    if (variant.isVoid) return `(r as HttpResponse<any>).clone({ body: undefined }) as ${responseClass}<${variant.resultType}>`;
    if (variant.isNumber) return `(r as HttpResponse<any>).clone({ body: parseFloat(String((r as HttpResponse<any>).body)) }) as ${responseClass}<${variant.resultType}>`;
    if (variant.isBoolean) return `(r as HttpResponse<any>).clone({ body: String((r as HttpResponse<any>).body) === 'true' }) as ${responseClass}<${variant.resultType}>`;
    return `r as ${responseClass}<${variant.resultType}>`;
}

function renderRequestBodyLines(variant: OaOperationVariant): string[] {
    if (!variant.requestBody) return [];
    return [`  rb.body(params.body, '${variant.requestBody.mediaType}');`];
}

function buildDirectBodyMethodStatements(service: OaService, variant: OaOperationVariant): MethodDeclarationStructure['statements'] {
    return [
        {
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: 'rb',
                    initializer: `new ${variant.options.requestBuilder}(this.rootUrl, ${service.typeName}.${variant.operation.pathVar}, '${variant.operation.method}')`,
                },
            ],
        },
        (writer) => {
            writer.writeLine('if (params) {');
            for (const parameter of variant.operation.parameters) {
                writer.writeLine(
                    `  rb.${parameter.in}('${parameter.name}', params${parameter.varAccess}, ${parameter.parameterOptions});`,
                );
            }
            for (const line of renderRequestBodyLines(variant)) {
                writer.writeLine(line);
            }
            writer.writeLine('}');
        },
        (writer) => {
            writer.writeLine('return this.http.request(');
            writer.writeLine(`  rb.build({ responseType: '${variant.responseType}', accept: '${variant.accept}', context: context })`);
            writer.writeLine(').pipe(');
            writer.writeLine('  filter((r: any) => r instanceof HttpResponse),');
            writer.writeLine(`  map((r: HttpResponse<any>) => ${renderHandleResponse(variant, service.options.response)}),`);
            writer.writeLine(`  map((r: ${service.options.response}<${variant.resultType}>) => r.body as ${variant.resultType}),`);
            writer.write(');');
        },
    ];
}

function toInlineDoc(text: string, level: number): string {
    const indent = '  '.repeat(level);
    const lines = text.split('\n');
    return [indent + '/**', ...lines.map((line) => `${indent} * ${line}`), indent + ' */'].join('\n');
}
