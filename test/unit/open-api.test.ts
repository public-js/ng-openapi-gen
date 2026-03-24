import type { OpenAPIObject } from 'openapi3-ts';
import { describe, expect, test } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { tsTypeVal } from '../../src/utils/open-api.js';

describe('open-api utils', () => {
    test('renders additionalProperties-only objects on one line', () => {
        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
        } as OpenAPIObject;
        const options = resolveOptions({ input: 'inline.json' });

        const type = tsTypeVal(
            {
                type: 'object',
                additionalProperties: {
                    type: 'number',
                },
            },
            openApi,
            options,
        );

        expect(type).toBe('{ [key: string]: number; }');
    });
});
