import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { loadOpenApi } from '../../src/utils/spec-loader.js';

const spec = (ref: string) =>
    JSON.stringify({
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        components: { schemas: { Foo: { $ref: ref } } },
    });

const servers: Server[] = [];

async function serve(handler: RequestListener): Promise<number> {
    const server = createServer(handler);
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    return (server.address() as AddressInfo).port;
}

const json =
    (body: string): RequestListener =>
    (_request, response) => {
        response.setHeader('content-type', 'application/json');
        response.end(body);
    };

afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

describe('loadOpenApi', () => {
    test('loads a spec from localhost, along with same-origin references', async () => {
        const port = await serve((request, response) =>
            json(request.url === '/spec.json' ? spec('/foo.json') : '{"type":"string"}')(request, response),
        );

        const openApi = await loadOpenApi(`http://localhost:${port}/spec.json`, 3_000);

        expect(openApi.components?.schemas?.Foo).toEqual({ type: 'string' });
    });

    test('blocks references to another internal origin', async () => {
        const hits: string[] = [];
        const otherPort = await serve((request, response) => {
            hits.push(request.url!);
            json('{"type":"string"}')(request, response);
        });
        const port = await serve(json(spec(`http://127.0.0.1:${otherPort}/secret.json`)));

        await expect(loadOpenApi(`http://localhost:${port}/spec.json`, 3_000)).rejects.toThrow();
        expect(hits).toEqual([]);
    });

    test('does not trust another host on the same port', async () => {
        const hits: string[] = [];
        const port = await serve((request, response) => {
            hits.push(request.url!);
            json(request.url === '/spec.json' ? spec(`http://127.0.0.1:${port}/secret.json`) : '{}')(request, response);
        });

        await expect(loadOpenApi(`http://localhost:${port}/spec.json`, 3_000)).rejects.toThrow();
        expect(hits).toEqual(['/spec.json']);
    });

    test('blocks references to internal URLs from a spec file', async () => {
        const hits: string[] = [];
        const port = await serve((request, response) => {
            hits.push(request.url!);
            json('{"type":"string"}')(request, response);
        });
        const dir = mkdtempSync(join(tmpdir(), 'load-spec-'));
        writeFileSync(join(dir, 'spec.json'), spec(`http://localhost:${port}/secret.json`));

        try {
            await expect(loadOpenApi(join(dir, 'spec.json'), 3_000)).rejects.toThrow();
            expect(hits).toEqual([]);
        } finally {
            rmSync(dir, { recursive: true });
        }
    });

    test('applies the timeout to the trusted origin', async () => {
        const port = await serve(() => undefined);

        await expect(loadOpenApi(`http://localhost:${port}/spec.json`, 50)).rejects.toThrow();
    });
});
