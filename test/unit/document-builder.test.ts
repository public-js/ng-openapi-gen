import type { OpenAPIObject } from 'openapi3-ts';
import { describe, expect, test } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { HookRunner } from '../../src/core/hooks/runner.js';
import { GeneratorDocumentBuilder } from '../../src/core/ir/document-builder.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';

async function buildDocument(openApi: OpenAPIObject, optionOverrides: Record<string, unknown> = {}) {
    const options = resolveOptions({
        input: 'inline.json',
        ...optionOverrides,
    });
    const logger = new GeneratorLogger(false);
    const hooks = new HookRunner([], options, logger);
    return new GeneratorDocumentBuilder(openApi, options, hooks, logger).build();
}

describe('document builder', () => {
    test('deduplicates duplicate operation ids', async () => {
        const document = await buildDocument({
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {
                '/a': { get: { operationId: 'findAll', responses: { '200': { description: 'ok' } } } },
                '/b': { get: { operationId: 'findAll', responses: { '200': { description: 'ok' } } } },
            },
        } as OpenAPIObject);

        expect(document.operations.map((operation) => operation.id)).toEqual(['findAll', 'findAll_1']);
    });

    test('applies tag include and exclude filtering', async () => {
        const openApi = {
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            paths: {
                '/a': { get: { tags: ['One'], responses: { '200': { description: 'ok' } } } },
                '/b': { get: { tags: ['Two'], responses: { '200': { description: 'ok' } } } },
            },
        } as OpenAPIObject;

        const included = await buildDocument(openApi, { includeTags: ['One'] });
        expect(included.services.map((service) => service.name)).toEqual(['One']);

        const excluded = await buildDocument(openApi, { excludeTags: ['Two'] });
        expect(excluded.services.map((service) => service.name)).toEqual(['One']);
    });
});
