import { describe, expect, test } from 'vitest';

import { emit } from './emit-helper.js';

const spec = (schemas: object) => ({
    openapi: '3.1.0',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
    components: { schemas },
});

async function modelSource(schemas: object, path = 'models/thing.ts', overrides = {}) {
    const { file } = await emit(spec(schemas), [], { ignoreUnusedModels: false, ...overrides });
    return file(path)!.replaceAll(/\s+/g, ' ');
}

const thing = (properties: object) => ({ Thing: { type: 'object', properties } });

describe('OpenAPI 3.1 schemas', () => {
    test('treats a null entry in a type list as nullable', async () => {
        expect(await modelSource(thing({ a: { type: ['string', 'null'] } }))).toContain('a?: null | string;');
    });

    test('renders several types as a union', async () => {
        expect(await modelSource(thing({ a: { type: ['string', 'number'] } }))).toMatch(/a\?: \(?string \| number\)?;/);
    });

    test('renders the null type', async () => {
        expect(await modelSource(thing({ a: { type: 'null' } }))).toContain('a?: null;');
    });

    test('renders nullable array items', async () => {
        expect(await modelSource(thing({ a: { type: 'array', items: { type: ['integer', 'null'] } } }))).toContain(
            'a?: Array<number | null>;',
        );
    });

    test('renders const as a literal type', async () => {
        const source = await modelSource(thing({ a: { const: 'fixed' }, b: { const: 1 } }));
        expect(source).toContain("a?: 'fixed';");
        expect(source).toContain('b?: 1;');
    });

    test('renders null in an inline enum as nullable instead of a string', async () => {
        const source = await modelSource(thing({ a: { type: ['string', 'null'], enum: ['x', 'y', null] } }));
        expect(source).toContain("a?: null | 'x' | 'y';");
    });

    test('keeps enum members aligned with their names when an enum contains null', async () => {
        const source = await modelSource(
            {
                Thing: {
                    type: ['string', 'null'],
                    enum: ['x', null, 'y'],
                    'x-enumNames': ['First', 'Nothing', 'Third'],
                },
            },
            'models/thing.ts',
            { enumStyle: 'pascal' },
        );
        expect(source).toContain("First = 'x'");
        expect(source).toContain("Third = 'y'");
        expect(source).not.toContain('Nothing');
    });

    test('marks references to nullable models as nullable', async () => {
        const source = await modelSource({
            ...thing({ a: { $ref: '#/components/schemas/Other' } }),
            Other: { type: ['object', 'null'], properties: { b: { type: 'string' } } },
        });
        expect(source).toContain('a?: null | Other;');
    });

    test('does not generate an interface for an object that may be another type', async () => {
        const source = await modelSource({
            Thing: { type: ['object', 'string'], properties: { a: { type: 'string' } } },
        });
        expect(source).toContain('export type Thing =');
        expect(source).toContain('| string');
    });

    test('only keeps the array shape on the array member of a union', async () => {
        const source = await modelSource(thing({ a: { type: ['array', 'string'], items: { type: 'number' } } }));
        expect(source).toMatch(/a\?: \(?Array<number> \| string\)?;/);
    });
});

describe('nullable schemas outside of properties', () => {
    const operation = (schema: object, extra: object = {}) => ({
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
            '/a': {
                post: {
                    operationId: 'go',
                    tags: ['x'],
                    responses: { 200: { description: 'ok', content: { 'application/json': { schema } } } },
                    ...extra,
                },
            },
        },
    });
    const serviceSource = async (spec: object) =>
        (await emit(spec)).file('services/x.service.ts')!.replaceAll(/\s+/g, ' ');
    const nullableString = { type: ['string', 'null'] };

    test('keeps null in responses', async () => {
        expect(await serviceSource(operation(nullableString))).toContain('Observable<null | string>');
    });

    test('keeps null in responses with the 3.0 nullable keyword', async () => {
        const spec = { ...operation({ type: 'string', nullable: true }), openapi: '3.0.3' };
        expect(await serviceSource(spec)).toContain('Observable<null | string>');
    });

    test('keeps null in parameters', async () => {
        const parameters = [{ name: 'q', in: 'query', schema: nullableString }];
        expect(await serviceSource(operation({ type: 'string' }, { parameters }))).toContain('q?: null | string;');
    });

    test('keeps null in request bodies', async () => {
        const requestBody = { content: { 'application/json': { schema: nullableString } } };
        expect(await serviceSource(operation({ type: 'string' }, { requestBody }))).toContain('body?: null | string');
    });

    test('still requests a blob for a nullable binary response', async () => {
        const source = await serviceSource(operation({ type: ['string', 'null'], format: 'binary' }));
        expect(source).toContain("responseType: 'blob'");
        expect(source).toContain('Observable<null | Blob>');
    });

    test('keeps null in additional properties', async () => {
        const source = await modelSource({ Thing: { type: 'object', additionalProperties: nullableString } });
        expect(source).toContain('[key: string]: null | string;');
    });

    test('keeps null in additional properties of an inline object', async () => {
        const source = await modelSource(thing({ a: { type: 'object', additionalProperties: nullableString } }));
        expect(source).toContain('[key: string]: null | string;');
    });

    test('keeps null in union members', async () => {
        const source = await modelSource(thing({ a: { oneOf: [nullableString, { type: 'number' }] } }));
        expect(source).toContain('a?: (null | string | number);');
    });

    test('adds null on references to a nullable model, not on the model', async () => {
        const schemas = {
            ...thing({ a: { $ref: '#/components/schemas/Other' } }),
            Other: { type: ['string', 'number', 'null'] },
        };
        expect(await modelSource(schemas)).toContain('a?: null | Other;');
        expect(await modelSource(schemas, 'models/other.ts')).toContain('export type Other = (string | number);');
    });

    test('does not repeat null for a schema that only allows null', async () => {
        const source = await modelSource(
            thing({
                a: { type: ['null'] },
                b: { type: ['string', 'null'], enum: [null] },
                c: { type: ['string', 'null'], const: null },
            }),
        );
        expect(source).toContain('a?: null;');
        expect(source).toContain('b?: null;');
        expect(source).toContain('c?: null;');
    });

    test('does not put a nullable allOf member in front of the intersection', async () => {
        const source = await modelSource({
            Thing: {
                allOf: [{ type: ['object', 'null'], properties: { a: { type: 'string' } } }, { required: ['a'] }],
            },
        });
        expect(source).not.toContain('null |');
    });
});

describe('boolean schemas', () => {
    test('accepts boolean properties', async () => {
        expect(await modelSource(thing({ a: true }))).toContain('a?: any;');
    });

    test('accepts boolean array items', async () => {
        expect(await modelSource(thing({ a: { type: 'array', items: true } }))).toContain('a?: Array<any>;');
    });

    test('accepts references to boolean component schemas', async () => {
        const source = await modelSource({ ...thing({ a: { $ref: '#/components/schemas/Other' } }), Other: true });
        expect(source).toContain('a?: Other;');
    });
});

describe('literal types', () => {
    test('renders object and array values as literal types', async () => {
        const source = await modelSource(thing({ a: { const: { k: 1 } }, b: { const: [1, 'x'] } }));
        expect(source).toContain("a?: { 'k': 1 };");
        expect(source).toContain("b?: [1, 'x'];");
    });
});

describe('OpenAPI 3.0 schemas', () => {
    test('still understands the nullable keyword', async () => {
        const source = await modelSource(thing({ a: { type: 'string', nullable: true } }));
        expect(source).toContain('a?: null | string;');
    });

    test('renders null in a nullable enum as nullable instead of a string', async () => {
        const source = await modelSource(thing({ a: { type: 'string', nullable: true, enum: ['x', null] } }));
        expect(source).toContain("a?: null | 'x';");
    });
});
