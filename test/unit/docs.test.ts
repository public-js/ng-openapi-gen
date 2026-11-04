import type { OpenAPIObject } from 'openapi3-ts';
import { describe, expect, test } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { emitDocument } from '../../src/core/emitter/emit-document.js';
import { HookRunner } from '../../src/core/hooks/runner.js';
import { GeneratorDocumentBuilder } from '../../src/core/generation/document-builder.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';

async function emit(openApi: OpenAPIObject) {
    const options = resolveOptions({ input: 'inline.json' });
    const logger = new GeneratorLogger(false);
    const hooks = new HookRunner([], options, logger);
    const document = await new GeneratorDocumentBuilder(openApi, options, hooks, logger).build();
    const files = await emitDocument(document, hooks);
    return (relativePath: string) => files.find((file) => file.relativePath === relativePath)?.content;
}

// The fixture tests compare ASTs without comments, so doc comments are only covered here
describe('doc comments', () => {
    const fooSchema = { $ref: '#/components/schemas/Foo' };

    test('renders descriptions, deprecations and escaped comment ends', async () => {
        const file = await emit({
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            tags: [{ name: 'Things', description: 'Service docs' }],
            paths: {
                '/foo': {
                    post: {
                        operationId: 'getFoo',
                        tags: ['Things'],
                        deprecated: true,
                        summary: 'Gets it',
                        description: 'Operation docs',
                        parameters: [
                            { name: 'id', in: 'query', description: 'Parameter docs', schema: { type: 'string' } },
                            { name: 'old', in: 'query', deprecated: true, schema: { type: 'string' } },
                        ],
                        requestBody: {
                            description: 'Body docs',
                            content: { 'application/json': { schema: fooSchema } },
                        },
                        responses: {
                            '200': { description: 'ok', content: { 'application/json': { schema: fooSchema } } },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Foo: {
                        type: 'object',
                        description: 'Model docs\n\nwith a */ inside',
                        deprecated: true,
                        properties: {
                            plain: { type: 'string', description: 'Property docs' },
                            legacy: { type: 'string', deprecated: true },
                            none: { type: 'string' },
                        },
                    },
                },
            },
        } as OpenAPIObject);

        expect(file('models/foo.ts')).toBe(
            [
                '/**',
                ' * Model docs',
                ' *',
                ' * with a * /  inside',
                ' *',
                ' * @deprecated',
                ' */',
                'export interface Foo {',
                '  /** @deprecated */',
                '  legacy?: string;',
                '  none?: string;',
                '  /** Property docs */',
                '  plain?: string;',
                '}',
                '',
            ].join('\n'),
        );

        const service = file('services/things.service.ts');
        expect(service).toContain('/** Service docs */\n@Injectable()');
        expect(service).toMatch(/\/\*\*\n\s+\* Parameter docs\n\s+\*\/\n\s+id\?: string;/);
        expect(service).toMatch(/\/\*\*\n\s+\* @deprecated\n\s+\*\/\n\s+old\?: string;/);
        expect(service).toMatch(/\/\*\*\n\s+\* Body docs\n\s+\*\/\n\s+body\?: Foo;/);
        expect(service).toContain(
            [
                '  /**',
                '   * Gets it.',
                '   *',
                '   * Operation docs',
                '   *',
                '   * This method provides access only to the response body.',
                '   *',
                '   * This method sends `application/json` and handles the request body of type `application/json`.',
                '   *',
                '   * @deprecated',
                '   */',
                '  public getFoo(',
            ].join('\n'),
        );
    });
});
