import { readFileSync } from 'node:fs';

import { Scope, type SourceFile, VariableDeclarationKind } from 'ts-morph';

import type { GeneratorDocument } from '../generation/document.js';
import { OaImport } from '../models/oa-import.js';
import { namedSpecifier } from './source-file-helpers.js';

const DEFAULT_REQUEST_BUILDER_CLASS = 'RequestBuilder';
const DEFAULT_RESPONSE_CLASS = 'StrictHttpResponse';

export function renderRequestBuilder(document: GeneratorDocument): string {
    const { autoGenerationNotice, requestBuilderClass, responseClass } = document.globals;
    return readFileSync(new URL('../../support/request-builder.ts', import.meta.url), 'utf8')
        .replace('/*__AUTO_GENERATION_NOTICE__*/', autoGenerationNotice.trim())
        .replace(new RegExp(`\\b${DEFAULT_REQUEST_BUILDER_CLASS}\\b`, 'g'), requestBuilderClass)
        .replace(new RegExp(`\\b${DEFAULT_RESPONSE_CLASS}\\b`, 'g'), responseClass);
}

export function buildConfigurationSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    sourceFile.addStatements(document.globals.autoGenerationNotice);
    sourceFile.addImportDeclaration({
        moduleSpecifier: '@angular/core',
        namedImports: ['InjectionToken'],
    });
    sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: document.globals.rootUrlToken,
                type: 'InjectionToken<string>',
                initializer: `new InjectionToken<string>('_${document.globals.rootUrlToken}')`,
            },
        ],
    });
}

export function buildModuleSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    sourceFile.addStatements(document.globals.autoGenerationNotice);
    const useInjectFunction = document.options.injectionStyle === 'inject';
    sourceFile.addImportDeclarations([
        { moduleSpecifier: '@angular/common/http', namedImports: ['HttpClient'] },
        {
            moduleSpecifier: '@angular/core',
            namedImports: useInjectFunction ? ['NgModule', 'inject'] : ['NgModule', 'Optional', 'SkipSelf'],
        },
        ...document.services.map((service) => ({
            moduleSpecifier: `${document.globals.pathToServicesDir}${service.fileName}`,
            namedImports: [service.typeName],
        })),
    ]);
    sourceFile.addClass({
        isExported: true,
        name: document.globals.moduleClass,
        decorators: [
            {
                name: 'NgModule',
                arguments: [
                    `{
  providers: [
${document.services.map((service) => `    ${service.typeName},`).join('\n')}
  ],
}`,
                ],
            },
        ],
        properties: useInjectFunction
            ? [
                  {
                      name: 'parentModule',
                      type: `${document.globals.moduleClass} | null`,
                      scope: Scope.Private,
                      initializer: `inject(${document.globals.moduleClass}, { optional: true, skipSelf: true })`,
                  },
                  {
                      name: 'http',
                      type: 'HttpClient | null',
                      scope: Scope.Private,
                      initializer: 'inject(HttpClient, { optional: true })',
                  },
              ]
            : [],
        ctors: [
            {
                parameters: useInjectFunction
                    ? []
                    : [
                          {
                              name: 'parentModule',
                              type: document.globals.moduleClass,
                              decorators: [
                                  { name: 'Optional', arguments: [] },
                                  { name: 'SkipSelf', arguments: [] },
                              ],
                          },
                          {
                              name: 'http',
                              type: 'HttpClient',
                              decorators: [{ name: 'Optional', arguments: [] }],
                          },
                      ],
                statements: [
                    (writer) => {
                        writer.writeLine(`if (${useInjectFunction ? 'this.parentModule' : 'parentModule'}) {`);
                        writer.writeLine(
                            `  throw new Error('${document.globals.moduleClass} is already loaded. Import in your base AppModule only.');`,
                        );
                        writer.write('}');
                    },
                    (writer) => {
                        writer.writeLine(`if (!${useInjectFunction ? 'this.http' : 'http'}) {`);
                        writer.writeLine(
                            "  throw new Error('You need to import the HttpClientModule in your AppModule.');",
                        );
                        writer.write('}');
                    },
                ],
            },
        ],
    });
}

export function buildModelIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    sourceFile.addExportDeclarations(
        modelImports(document).map((model) => ({
            isTypeOnly: !model.modelPtr?.isEnum,
            namedExports: [namedSpecifier(model)],
            moduleSpecifier: `${document.globals.pathToModelsDir}${model.file}`,
        })),
    );
}

export function buildServiceIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    sourceFile.addExportDeclarations(serviceExports(document));
}

export function buildRootIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    const { globals } = document;
    sourceFile.addExportDeclarations([
        { namedExports: [globals.rootUrlToken], moduleSpecifier: `./${globals.configurationFile}` },
        {
            namedExports: [globals.requestBuilderClass, globals.responseClass],
            moduleSpecifier: `./${globals.requestBuilderFile}`,
        },
        ...(globals.moduleClass && globals.moduleFile
            ? [{ namedExports: [globals.moduleClass], moduleSpecifier: `./${globals.moduleFile}` }]
            : []),
        ...modelImports(document).map((model) => ({
            namedExports: [namedSpecifier(model)],
            moduleSpecifier: `${globals.pathToModelsDir}${model.file}`,
        })),
        ...serviceExports(document),
    ]);
}

function modelImports(document: GeneratorDocument): OaImport[] {
    return document.models.map((model) => OaImport.fromModel(model));
}

function serviceExports(document: GeneratorDocument) {
    return document.services.map((service) => ({
        namedExports: [service.typeName],
        moduleSpecifier: `${document.globals.pathToServicesDir}${service.fileName}`,
    }));
}
