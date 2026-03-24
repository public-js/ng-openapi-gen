import ts from 'typescript';

export function canonicalizeTypeScript(sourceText: string): string {
    const sourceFile = ts.createSourceFile('fixture.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    return JSON.stringify(visit(sourceFile), null, 2);
}

function visit(node: ts.Node): unknown {
    if (ts.isSourceFile(node)) {
        const imports = node.statements.filter(ts.isImportDeclaration).map(visit).sort(compareJson);
        const exports = node.statements.filter(ts.isExportDeclaration).map(visit).sort(compareJson);
        const otherStatements = node.statements
            .filter((statement) => !ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement))
            .map(visit);
        return {
            kind: kindName(node.kind),
            imports,
            exports,
            statements: otherStatements,
        };
    }

    if (ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        const namedBindings = clause?.namedBindings;
        return {
            kind: kindName(node.kind),
            module: node.moduleSpecifier.getText(),
            defaultImport: clause?.name?.text ?? null,
            namespaceImport:
                namedBindings && ts.isNamespaceImport(namedBindings) ? namedBindings.name.text : null,
            namedImports:
                namedBindings && ts.isNamedImports(namedBindings)
                    ? namedBindings.elements
                          .map((element) => ({
                              name: element.name.text,
                              propertyName: element.propertyName?.text ?? null,
                              isTypeOnly: element.isTypeOnly,
                          }))
                          .sort(compareJson)
                    : [],
            isTypeOnly: clause?.isTypeOnly ?? false,
        };
    }

    if (ts.isExportDeclaration(node)) {
        const exportClause =
            node.exportClause && ts.isNamedExports(node.exportClause)
                ? node.exportClause.elements
                      .map((element) => ({
                          name: element.name.text,
                          propertyName: element.propertyName?.text ?? null,
                          isTypeOnly: element.isTypeOnly,
                      }))
                      .sort(compareJson)
                : [];
        return {
            kind: kindName(node.kind),
            module: node.moduleSpecifier?.getText() ?? null,
            isTypeOnly: node.isTypeOnly,
            exportClause,
        };
    }

    const children = node.getChildren().filter((child) => {
        return (
            child.kind !== ts.SyntaxKind.EndOfFileToken &&
            child.kind !== ts.SyntaxKind.SyntaxList &&
            child.kind !== ts.SyntaxKind.JSDocComment
        );
    });
    const payload: Record<string, unknown> = { kind: kindName(node.kind) };

    if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) {
        payload.text = node.text;
    } else if (
        ts.isStringLiteral(node) ||
        ts.isNumericLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isRegularExpressionLiteral(node)
    ) {
        payload.text = node.text;
    }

    if (children.length > 0) {
        payload.children = children.map(visit);
    }

    return payload;
}

function kindName(kind: ts.SyntaxKind): string {
    return ts.SyntaxKind[kind];
}

function compareJson(left: unknown, right: unknown): number {
    return JSON.stringify(left).localeCompare(JSON.stringify(right));
}
