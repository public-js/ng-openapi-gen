import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import type { OpenAPIObject } from 'openapi3-ts';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, test } from 'vitest';

import { resolveOptions } from '../../src/config/options.js';
import { HookRunner } from '../../src/core/hooks/runner.js';
import { GeneratorDocumentBuilder } from '../../src/core/ir/document-builder.js';
import { writeGeneratedFiles } from '../../src/core/output/write-output.js';
import { GeneratorLogger } from '../../src/core/runtime/logger.js';
import { generate } from '../../src/index.js';

async function buildDocument(openApi: OpenAPIObject, optionOverrides: Record<string, unknown> = {}) {
    const options = resolveOptions({
        input: 'inline.json',
        ...optionOverrides,
    });
    const logger = new GeneratorLogger(false);
    const hooks = new HookRunner([], options, logger);
    return new GeneratorDocumentBuilder(openApi, options, hooks, logger).build();
}

describe('generator behavior', () => {
    test('prunes unused models when ignoreUnusedModels is enabled', async () => {
        const document = await buildDocument({
            openapi: '3.0.0',
            info: { title: 'Test', version: '1.0.0' },
            components: {
                schemas: {
                    Used: { type: 'object', properties: { id: { type: 'string' } } },
                    Unused: { type: 'object', properties: { id: { type: 'string' } } },
                },
            },
            paths: {
                '/items': {
                    get: {
                        tags: ['Items'],
                        responses: {
                            '200': {
                                description: 'ok',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Used' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as OpenAPIObject);

        expect(document.models.map((model) => model.name)).toEqual(['Used']);
    });

    test('uses default response and customized response type overrides', async () => {
        const document = await buildDocument(
            {
                openapi: '3.0.0',
                info: { title: 'Test', version: '1.0.0' },
                paths: {
                    '/download': {
                        get: {
                            tags: ['Files'],
                            responses: {
                                default: {
                                    description: 'fallback',
                                    content: {
                                        'application/octet-stream': {
                                            schema: { type: 'string', format: 'binary' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            } as OpenAPIObject,
            {
                customizedResponseType: {
                    '/download': {
                        toUse: 'arraybuffer',
                    },
                },
            },
        );

        const [operation] = document.operations;
        expect(operation.successResponse?.statusCode).toBe('default');
        expect(operation.variants[0]?.responseType).toBe('blob');
        expect(operation.variants[0]?.resultType).toBe('Blob');
    });

    test('removes stale files and applies requested line endings', () => {
        const outputDir = resolve(process.cwd(), '.tmp-output-test');
        rmSync(outputDir, { recursive: true, force: true });
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(join(outputDir, 'stale.ts'), 'stale', 'utf8');

        try {
            const options = resolveOptions({
                input: 'inline.json',
                output: outputDir,
                endOfLineStyle: 'crlf',
            });
            writeGeneratedFiles(
                [
                    {
                        id: 'test:file',
                        kind: 'ts',
                        relativePath: 'fresh.ts',
                        content: 'export const value = 1;\nexport const next = 2;\n',
                    },
                ],
                options,
                new GeneratorLogger(false),
            );

            expect(existsSync(join(outputDir, 'stale.ts'))).toBe(false);
            expect(readFileSync(join(outputDir, 'fresh.ts'), 'utf8')).toContain('\r\n');
        } finally {
            rmSync(outputDir, { recursive: true, force: true });
        }
    });

    test('supports generating a single body method when response methods are disabled globally', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-methods-'));
        const outputDir = join(tempDir, 'output');
        const inputPath = join(tempDir, 'methods.json');

        try {
            writeFileSync(
                inputPath,
                JSON.stringify({
                    openapi: '3.0.0',
                    info: { title: 'Test', version: '1.0.0' },
                    paths: {
                        '/plain': {
                            get: {
                                tags: ['Api'],
                                operationId: 'plain',
                                responses: {
                                    '200': {
                                        description: 'ok',
                                        content: {
                                            'application/json': {
                                                schema: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '/full': {
                            get: {
                                tags: ['Api'],
                                operationId: 'full',
                                responses: {
                                    '200': {
                                        description: 'ok',
                                        content: {
                                            'application/json': {
                                                schema: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                'utf8',
            );

            await generate({
                input: inputPath,
                output: outputDir,
                runEslint: false,
                runPrettier: false,
                generateResponseMethod: false,
            });

            const serviceSource = readFileSync(join(outputDir, 'services/api.service.ts'), 'utf8');
            expect(serviceSource).toContain('public plain(');
            expect(serviceSource).not.toContain('public plain$Response(');
            expect(serviceSource).toContain("map((r: HttpResponse<any>) => r as StrictHttpResponse<string>)");
            expect(serviceSource).toContain("map((r: StrictHttpResponse<string>) => r.body as string),");
            expect(serviceSource).toContain('public full(');
            expect(serviceSource).not.toContain('public full$Response(');
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('supports opt-in inject() based Angular dependency injection', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-inject-'));
        const outputDir = join(tempDir, 'output');
        const inputPath = join(tempDir, 'inject.json');

        try {
            writeFileSync(
                inputPath,
                JSON.stringify({
                    openapi: '3.0.0',
                    info: { title: 'Test', version: '1.0.0' },
                    paths: {
                        '/sample': {
                            get: {
                                tags: ['Api'],
                                operationId: 'sample',
                                responses: {
                                    '200': {
                                        description: 'ok',
                                        content: {
                                            'application/json': {
                                                schema: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                'utf8',
            );

            await generate({
                input: inputPath,
                output: outputDir,
                runEslint: false,
                runPrettier: false,
                injectionStyle: 'inject',
            });

            const serviceSource = readFileSync(join(outputDir, 'services/api.service.ts'), 'utf8');
            const moduleSource = readFileSync(join(outputDir, 'api.module.ts'), 'utf8');

            expect(serviceSource).toContain("import { inject, Injectable } from '@angular/core';");
            expect(serviceSource).toContain(`private rootUrl: string = inject(API_ROOT_URL_TOKEN);`);
            expect(serviceSource).toContain(`private http: HttpClient = inject(HttpClient);`);
            expect(serviceSource).not.toContain('constructor(@Inject(API_ROOT_URL_TOKEN)');

            expect(moduleSource).toContain("import { NgModule, inject } from '@angular/core';");
            expect(moduleSource).toContain(`private parentModule: ApiModule | null = inject(ApiModule, { optional: true, skipSelf: true });`);
            expect(moduleSource).toContain(`private http: HttpClient | null = inject(HttpClient, { optional: true });`);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('provides services in root when module generation is disabled', async () => {
        const tempDir = mkdtempSync(join(tmpdir(), 'ng-openapi-gen-root-provider-'));
        const outputDir = join(tempDir, 'output');
        const inputPath = join(tempDir, 'root-provider.json');

        try {
            writeFileSync(
                inputPath,
                JSON.stringify({
                    openapi: '3.0.0',
                    info: { title: 'Test', version: '1.0.0' },
                    paths: {
                        '/sample': {
                            get: {
                                tags: ['Api'],
                                operationId: 'sample',
                                responses: {
                                    '200': {
                                        description: 'ok',
                                        content: {
                                            'application/json': {
                                                schema: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                'utf8',
            );

            await generate({
                input: inputPath,
                output: outputDir,
                runEslint: false,
                runPrettier: false,
                module: false,
            });

            const serviceSource = readFileSync(join(outputDir, 'services/api.service.ts'), 'utf8');
            expect(serviceSource).toContain(`@Injectable({ providedIn: 'root' })`);
            expect(existsSync(join(outputDir, 'api.module.ts'))).toBe(false);
        } finally {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
