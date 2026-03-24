import { fileRead, resolveFromIMU } from '../../utils/file-system.js';
import type { GeneratorDocument } from '../ir/document.js';

const DEFAULT_REQUEST_BUILDER_CLASS = 'RequestBuilder';
const DEFAULT_RESPONSE_CLASS = 'StrictHttpResponse';

export function emitRequestBuilderSource(document: GeneratorDocument): string {
    const assetPath = resolveFromIMU(import.meta.url, '../../support/request-builder.ts');
    let content = fileRead(assetPath);

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
