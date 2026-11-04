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
});
