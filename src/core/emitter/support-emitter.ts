import { readFileSync } from 'node:fs';

import type { GeneratorDocument } from '../generation/document.js';

const DEFAULT_REQUEST_BUILDER_CLASS = 'RequestBuilder';
const DEFAULT_RESPONSE_CLASS = 'StrictHttpResponse';

export function emitRequestBuilderSource(document: GeneratorDocument): string {
    let content = readFileSync(new URL('../../support/request-builder.ts', import.meta.url), 'utf8');

    content = content.replace('/*__AUTO_GENERATION_NOTICE__*/', document.globals.autoGenerationNotice.trim());
    if (document.globals.requestBuilderClass !== DEFAULT_REQUEST_BUILDER_CLASS) {
        content = content.replace(
            new RegExp(`\\b${DEFAULT_REQUEST_BUILDER_CLASS}\\b`, 'g'),
            document.globals.requestBuilderClass,
        );
    }
    if (document.globals.responseClass !== DEFAULT_RESPONSE_CLASS) {
        content = content.replace(new RegExp(`\\b${DEFAULT_RESPONSE_CLASS}\\b`, 'g'), document.globals.responseClass);
    }
    return content;
}
