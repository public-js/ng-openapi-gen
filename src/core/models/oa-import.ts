import { posix } from 'node:path';

import { Options } from '../../config/options.js';
import { qualifiedName, unqualifiedName } from '../../utils/open-api.js';
import { fileName, namespace } from '../../utils/string.js';
import { OaModel } from './oa-model.js';

export class OaImport {
    public file: string;

    private constructor(
        public refName: string,
        public typeName: string,
        public qualifiedName: string,
        public useAlias: boolean,
        public namespace: string | undefined,
        public fileName: string,
        public modelPtr?: OaModel,
    ) {
        this.file = (namespace ? `${namespace}/` : '') + fileName;
    }

    public static fromModel(model: OaModel): OaImport {
        const { refName, typeName, assumedName, options } = model;
        return new OaImport(
            refName,
            typeName,
            assumedName,
            typeName !== assumedName,
            namespace(refName),
            fileName(unqualifiedName(refName, options)),
            model,
        );
    }

    public static fromRef(options: Options, refName: string): OaImport {
        const typeName = unqualifiedName(refName, options);
        const aliasName = qualifiedName(refName, options);
        return new OaImport(
            refName,
            typeName,
            aliasName,
            typeName !== aliasName,
            namespace(refName),
            fileName(typeName),
        );
    }

    /** A copy for use within one file, which decides on its own whether an alias is needed. */
    public static fromImport(source: OaImport): OaImport {
        return new OaImport(
            source.refName,
            source.typeName,
            source.qualifiedName,
            false,
            source.namespace,
            source.fileName,
            source.modelPtr,
        );
    }

    /** Returns the import path of this model from a file in `sourceDir`. Both are relative to the output root. */
    public getRelativePath(sourceDir: string, modelsDir: string): string {
        const path = posix.relative(sourceDir, posix.join(modelsDir, this.file));
        return path.startsWith('..') ? path : `./${path}`;
    }
}
