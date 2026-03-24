import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { OpenAPIObject } from 'openapi3-ts';

import { resolveOptions, type Options, type OptionsInput } from '../config/options.js';
import { GeneratorDocumentBuilder } from './generation/document-builder.js';
import { emitDocument } from './emitter/emit-document.js';
import { writeGeneratedFiles } from './output/write-output.js';
import { GeneratorLogger } from './runtime/logger.js';

export interface GenerateResult {
    openApi: OpenAPIObject;
    writtenFiles: Array<{ id: string; relativePath: string; absolutePath: string }>;
}

export async function generate(input: Partial<OptionsInput> | Options): Promise<GenerateResult> {
    const options = resolveOptions(input);
    if (!options.input) {
        throw new Error('No input file path or URL is specified.');
    }

    const logger = new GeneratorLogger(options.verbose);
    const openApi = (await $RefParser.bundle(options.input, {
        dereference: { circular: false },
        resolve: { http: { timeout: options.fetchTimeout } },
    })) as OpenAPIObject;

    const document = await new GeneratorDocumentBuilder(openApi, options, logger).build();
    const files = emitDocument(document);
    const writtenFiles = writeGeneratedFiles(files, options, logger);

    logger.info(
        `Generated ${document.models.length} models and ${document.services.length} services from ${options.input}.`,
    );
    return { openApi, writtenFiles };
}
