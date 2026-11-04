import { OaModel } from './oa-model.js';
import { Options } from '../../config/options.js';
import { qualifiedName, unqualifiedName } from '../../utils/open-api.js';
import { fileName, namespace } from '../../utils/string.js';

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

    public getRelativePath(sourceNamespaceSplit: string[], pathToModels: string): string {
        const namespaceSplit = (this.namespace || '').split('/').filter(Boolean);
        const [nsLen, srcNsLen] = [namespaceSplit.length, sourceNamespaceSplit.length];

        if (nsLen === 0 && srcNsLen === 0) {
            return pathToModels ? `${pathToModels}${this.fileName}` : `./${this.fileName}`;
        }

        let diffIx = null;
        for (const currentIx in namespaceSplit) {
            if (namespaceSplit[currentIx] !== sourceNamespaceSplit[currentIx]) {
                diffIx = currentIx;
                break;
            }
        }

        if (diffIx === null) {
            return nsLen === srcNsLen ? `./${this.fileName}` : '../'.repeat(srcNsLen - nsLen) + this.fileName;
        }

        const goUpCount = srcNsLen - diffIx;
        const goUpPart = goUpCount ? '../'.repeat(goUpCount) : pathToModels ? '' : './';
        const goDownPart = namespaceSplit.slice(diffIx).join('/');
        return `${pathToModels}${goUpPart}${goDownPart}/${this.fileName}`;
    }
}
