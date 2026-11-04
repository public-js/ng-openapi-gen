import $RefParser, {
    type FileInfo,
    getJsonSchemaRefParserDefaultOptions,
    type HTTPResolverOptions,
} from '@apidevtools/json-schema-ref-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

const HTTP_URL = /^https?:/i;

/**
 * json-schema-ref-parser refuses local and internal URLs by default, which would break the common
 * `http://localhost:8080/v3/api-docs` setup. The origin the user asked for is trusted, so it gets its own
 * resolver with that check turned off. Every other URL still goes through the default resolver and all of its
 * checks, so a spec can't use a `$ref` to reach into the user's network.
 */
function trustedOriginResolver(input: string, timeout: number) {
    const { origin } = new URL(input);
    const httpResolver = getJsonSchemaRefParserDefaultOptions().resolve.http as HTTPResolverOptions;
    const read = httpResolver.read as (this: HTTPResolverOptions, file: FileInfo) => Promise<Buffer>;
    const trustedOptions = { ...httpResolver, timeout, safeUrlResolver: false };
    return {
        order: httpResolver.order! - 1,
        canRead: ({ url }: FileInfo) => HTTP_URL.test(url) && new URL(url).origin === origin,
        read: (file: FileInfo) => read.call(trustedOptions, file),
    };
}

/** Loads the spec from a file path or a URL, bundling the external references it uses */
export async function loadOpenApi(input: string, timeout: number): Promise<OpenAPIObject> {
    const resolve = {
        http: { timeout },
        ...(HTTP_URL.test(input) && { trustedOrigin: trustedOriginResolver(input, timeout) }),
    };
    return (await $RefParser.bundle(input, { resolve })) as OpenAPIObject;
}
