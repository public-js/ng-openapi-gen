import type { OpenAPIObject } from 'openapi3-ts';

import type { Options } from '../../config/options.js';
import type { GeneratorLogger } from '../runtime/logger.js';
import type { Globals } from './legacy/globals.js';
import type { OaModel } from './legacy/oa-model.js';
import type { OaOperation } from './legacy/oa-operation.js';
import type { OaService } from './legacy/oa-service.js';

export interface GeneratorDocument {
    openApi: OpenAPIObject;
    options: Options;
    logger: GeneratorLogger;
    globals: Globals;
    models: OaModel[];
    operations: OaOperation[];
    services: OaService[];
    modelsById: Map<string, OaModel>;
    operationsById: Map<string, OaOperation>;
    servicesById: Map<string, OaService>;
}

export type GeneratedFileKind = 'ts' | 'text';

export interface GeneratedFile {
    id: string;
    kind: GeneratedFileKind;
    relativePath: string;
    content: string;
}
