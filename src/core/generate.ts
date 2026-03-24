import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { OpenAPIObject } from 'openapi3-ts';

import { resolveOptions, type Options, type OptionsInput } from '../config/options.js';
import { GeneratorDocumentBuilder } from './ir/document-builder.js';
import { emitDocument } from './emitter/emit-document.js';
import { loadHooks } from './hooks/loader.js';
import { HookRunner } from './hooks/runner.js';
import { runPostProcessors } from './output/post-process.js';
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
    const hooks = new HookRunner(await loadHooks(options.hooks), options, logger);
    let openApi = (await $RefParser.bundle(options.input, {
        dereference: { circular: false },
        resolve: { http: { timeout: options.fetchTimeout } },
    })) as OpenAPIObject;
    openApi = await hooks.transformOpenApi(openApi);

    const document = await new GeneratorDocumentBuilder(openApi, options, hooks, logger).build();
    const files = await emitDocument(document, hooks);
    const writtenFiles = writeGeneratedFiles(files, options, logger);
    await runPostProcessors(options, logger);
    await hooks.afterWrite(writtenFiles, { openApi, document });

    logger.info(`Generated ${document.models.length} models and ${document.services.length} services from ${options.input}.`);
    return { openApi, writtenFiles };
}
