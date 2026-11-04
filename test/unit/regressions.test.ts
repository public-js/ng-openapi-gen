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
});
