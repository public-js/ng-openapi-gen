import { Scope, VariableDeclarationKind, type SourceFile } from 'ts-morph';

import type { GeneratorDocument } from '../ir/document.js';
import { OaImport } from '../ir/legacy/oa-import.js';

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
    sourceFile.addImportDeclaration({
        moduleSpecifier: '@angular/common/http',
        namedImports: ['HttpClient'],
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: '@angular/core',
        namedImports: useInjectFunction ? ['NgModule', 'inject'] : ['NgModule', 'Optional', 'SkipSelf'],
    });
    for (const service of document.services) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: `${document.globals.pathToServicesDir}${service.fileName}`,
            namedImports: [service.typeName],
        });
    }
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
                              decorators: [{ name: 'Optional', arguments: [] }, { name: 'SkipSelf', arguments: [] }],
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
                        writer.writeLine("  throw new Error('You need to import the HttpClientModule in your AppModule.');");
                        writer.write('}');
                    },
                ],
            },
        ],
    });
}

export function buildModelIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    for (const model of document.models.map((entry) => new OaImport().fromModel(entry))) {
        sourceFile.addExportDeclaration({
            isTypeOnly: !model.isEnum,
            namedExports: [
                {
                    name: model.typeName,
                    alias: model.useAlias ? model.qualifiedName : undefined,
                },
            ],
            moduleSpecifier: `${document.globals.pathToModelsDir}${model.file}`,
        });
    }
}

export function buildServiceIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    for (const service of document.services) {
        sourceFile.addExportDeclaration({
            namedExports: [service.typeName],
            moduleSpecifier: `${document.globals.pathToServicesDir}${service.fileName}`,
        });
    }
}

export function buildRootIndexSourceFile(sourceFile: SourceFile, document: GeneratorDocument): void {
    sourceFile.addExportDeclaration({
        namedExports: [document.globals.rootUrlToken],
        moduleSpecifier: `./${document.globals.configurationFile}`,
    });
    sourceFile.addExportDeclaration({
        namedExports: [document.globals.requestBuilderClass, document.globals.responseClass],
        moduleSpecifier: `./${document.globals.requestBuilderFile}`,
    });
    if (document.globals.moduleClass && document.globals.moduleFile) {
        sourceFile.addExportDeclaration({
            namedExports: [document.globals.moduleClass],
            moduleSpecifier: `./${document.globals.moduleFile}`,
        });
    }
    for (const model of document.models.map((entry) => new OaImport().fromModel(entry))) {
        sourceFile.addExportDeclaration({
            namedExports: [
                {
                    name: model.typeName,
                    alias: model.useAlias ? model.qualifiedName : undefined,
                },
            ],
            moduleSpecifier: `${document.globals.pathToModelsDir}${model.file}`,
        });
    }
    for (const service of document.services) {
        sourceFile.addExportDeclaration({
            namedExports: [service.typeName],
            moduleSpecifier: `${document.globals.pathToServicesDir}${service.fileName}`,
        });
    }
}
