import { type SourceFile } from 'ts-morph';

import type { OaModel } from '../models/oa-model.js';
import { namedSpecifier, toDocs } from './source-file-helpers.js';

export function buildModelSourceFile(sourceFile: SourceFile, model: OaModel): void {
    sourceFile.addImportDeclarations(
        model.imports.map((imp) => ({ moduleSpecifier: imp.file, namedImports: [namedSpecifier(imp)] })),
    );

    if (model.isObject) {
        sourceFile.addInterface({
            isExported: true,
            name: model.typeName,
            docs: toDocs(model.docs),
            properties: model.properties.map((property) => ({
                name: property.identifier,
                hasQuestionToken: !property.required,
                type: property.type,
                docs: toDocs(property.docs),
            })),
            indexSignatures: model.additionalPropertiesType
                ? [
                      {
                          keyName: 'key',
                          keyType: 'string',
                          returnType: model.additionalPropertiesType,
                      },
                  ]
                : [],
        });
        return;
    }

    if (model.isEnum) {
        sourceFile.addEnum({
            isExported: true,
            name: model.typeName,
            docs: toDocs(model.docs),
            members: model.enumValues.map((value) => ({
                name: value.name,
                initializer: value.value,
            })),
        });
        return;
    }

    sourceFile.addTypeAlias({
        isExported: true,
        name: model.typeName,
        docs: toDocs(model.docs),
        type: model.simpleType,
    });
}
