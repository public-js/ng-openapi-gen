import type { OpenAPIObject } from 'openapi3-ts';

import { resolveOptions, type OptionsInput } from '../../src/config/options.js';
import { emitDocument } from '../../src/core/emitter/emit-document.js';
import { HookRunner } from '../../src/core/hooks/runner.js';
import type { GeneratorHook } from '../../src/core/hooks/types.js';
import { GeneratorDocumentBuilder } from '../../src/core/generation/document-builder.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';

export const specBase = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };

/** Runs the generator in memory. Returns the document, the files, and a lookup of file content by path. */
export async function emit(openApi: object, hookList: GeneratorHook[] = [], overrides: Partial<OptionsInput> = {}) {
    const options = resolveOptions({ input: 'inline.json', ...overrides });
    const logger = new GeneratorLogger(false);
    const hooks = new HookRunner(hookList, options, logger);
    const document = await new GeneratorDocumentBuilder(openApi as OpenAPIObject, options, hooks, logger).build();
    const files = await emitDocument(document, hooks);
    const file = (relativePath: string) => files.find((entry) => entry.relativePath === relativePath)?.content;
    return { document, files, file };
}

/** A spec with one GET operation per tag list, returning `Foo` */
export function specWithTags(tags: string[], schemas: object = { Foo: fooSchema }) {
    return {
        ...specBase,
        paths: {
            '/a': {
                get: {
                    operationId: 'getA',
                    tags,
                    responses: {
                        '200': {
                            description: 'ok',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Foo' } } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };
}

export const fooSchema = { type: 'object', properties: { a: { type: 'string' } } };
