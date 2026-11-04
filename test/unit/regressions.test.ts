import { describe, expect, test } from 'vitest';

import { emit, fooSchema, specBase, specWithTags } from './emit-helper.js';

describe('regressions', () => {
    test('an operation with several tags gets one method per service', async () => {
        const { document, file } = await emit(specWithTags(['One', 'Two']));

        expect(document.operations[0].variants).toHaveLength(1);
        for (const path of ['services/one.service.ts', 'services/two.service.ts']) {
            expect(file(path)?.match(/public getA\(/g)).toHaveLength(1);
            expect(file(path)?.match(/public getA\$Response\(/g)).toHaveLength(1);
        }
    });

    test('a dotted tag imports from the right depth', async () => {
        const { file } = await emit(specWithTags(['ns.Pet'], { Foo: fooSchema, 'other.Bar': fooSchema }));

        const service = file('services/ns/ns-pet.service.ts');
        expect(service).toContain("from '../../api-configuration'");
        expect(service).toContain("from '../../request-builder'");
        expect(service).toContain("from '../../models/foo'");
    });

    test('namespaced models import each other relatively', async () => {
        const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
        const { file } = await emit(
            {
                ...specBase,
                components: {
                    schemas: {
                        Root: { type: 'object', properties: { deep: ref('a.b.Deep'), sibling: ref('a.c.Other') } },
                        'a.b.Deep': { type: 'object', properties: { root: ref('Root'), other: ref('a.c.Other') } },
                        'a.c.Other': { type: 'object', properties: { deep: ref('a.b.Deep') } },
                    },
                },
            },
            [],
            { ignoreUnusedModels: false },
        );

        expect(file('models/root.ts')).toContain("from './a/b/deep'");
        expect(file('models/a/b/deep.ts')).toContain("from '../../root'");
        expect(file('models/a/b/deep.ts')).toContain("from '../c/other'");
    });

    test('escapes quotes in inline object keys', async () => {
        const { file } = await emit(
            {
                ...specBase,
                components: {
                    schemas: {
                        Inline: {
                            type: 'object',
                            nullable: true,
                            properties: { "it's": { type: 'string' } },
                        },
                    },
                },
            },
            [],
            { ignoreUnusedModels: false },
        );

        expect(file('models/inline.ts')).toContain("'it\\'s'?: string;");
    });

    test('leaves non-ASCII inline object keys readable', async () => {
        const { file } = await emit(
            {
                ...specBase,
                components: {
                    schemas: { Inline: { type: 'object', nullable: true, properties: { имя: { type: 'string' } } } },
                },
            },
            [],
            { ignoreUnusedModels: false },
        );

        expect(file('models/inline.ts')).toContain("'имя'?: string;");
    });

    test('matches enum members whose value needs escaping', async () => {
        const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
        const { file } = await emit(
            {
                ...specBase,
                components: {
                    schemas: {
                        Kind: { type: 'string', enum: ["it's", 'plain'], 'x-enumNames': ['Quoted', 'Plain'] },
                        Item: {
                            type: 'object',
                            properties: { kind: { allOf: [ref('Kind'), { enum: ["it's"] }] } },
                        },
                    },
                },
            },
            [],
            { ignoreUnusedModels: false },
        );

        expect(file('models/item.ts')).toContain('kind?: Kind.Quoted;');
    });

    test('keeps models only reachable through contentSchema', async () => {
        const schemas = {
            Foo: {
                type: 'object',
                properties: { p: { type: 'string', contentSchema: { $ref: '#/components/schemas/Inner' } } },
            },
            Inner: fooSchema,
            Unused: fooSchema,
        };
        const { file } = await emit(specWithTags(['One'], schemas));

        expect(file('models/foo.ts')).toContain("from './inner'");
        expect(file('models/inner.ts')).toBeDefined();
        expect(file('models/unused.ts')).toBeUndefined();
    });

    test('transformDocument can change the document lists', async () => {
        const schemas = { Foo: fooSchema, Extra: fooSchema };
        const { document, file } = await emit(
            specWithTags(['One'], { ...schemas, Other: fooSchema }),
            [
                {
                    transformDocument(document) {
                        document.services = [];
                        document.models = document.models.filter((model) => model.name !== 'Foo');
                    },
                },
            ],
            { ignoreUnusedModels: false },
        );

        expect(file('models/foo.ts')).toBeUndefined();
        expect(file('models/extra.ts')).toBeDefined();
        expect(file('services/one.service.ts')).toBeUndefined();
        expect(document.modelsById.has('#/components/schemas/Foo')).toBe(false);
        expect(document.servicesById.size).toBe(0);
    });

    test('hooks can add source files through the project', async () => {
        const seen: string[] = [];
        const { file } = await emit(specWithTags(['One']), [
            {
                generateAdditionalFiles(context) {
                    context.project?.createSourceFile('/virtual/extra/direct.ts', 'export const direct = 1;\n');
                },
                transformSourceFile(_sourceFile, metadata) {
                    seen.push(metadata.relativePath);
                },
            },
        ]);

        expect(file('extra/direct.ts')).toBe('export const direct = 1;\n');
        expect(seen).toContain('extra/direct.ts');
    });

    test('keeps files registered while source files are transformed', async () => {
        let registered = false;
        const { file } = await emit(specWithTags(['One']), [
            {
                transformSourceFile(_sourceFile, _metadata, context) {
                    if (!registered) {
                        registered = true;
                        context.registerGeneratedFile({ kind: 'ts', relativePath: 'late.ts', content: 'export {};\n' });
                        context.registerGeneratedFile({ relativePath: 'late.txt', content: 'late\n' });
                    }
                },
            },
        ]);

        expect(file('late.ts')).toBe('export {};\n');
        expect(file('late.txt')).toBe('late\n');
    });
});
