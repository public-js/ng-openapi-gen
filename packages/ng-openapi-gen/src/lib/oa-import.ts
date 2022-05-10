import { OaModel } from './oa-model.js';
import { Options } from './options.js';
import { qualifiedName, unqualifiedName } from './utils/open-api.js';
import { fileName, namespace } from './utils/string.js';

export class OaImport {
    public refName: string;
    public typeName: string;
    public qualifiedName: string;
    public useAlias: boolean;
    public file: string;

    public namespace?: string;
    public fileName: string;

    public fromModel(model: OaModel): OaImport {
        this.refName = model.refName;
        this.typeName = model.typeName;
        this.qualifiedName = model.assumedName;
        this.useAlias = this.typeName !== this.qualifiedName;
        [this.namespace, this.fileName] = [
            namespace(model.refName),
            fileName(unqualifiedName(model.refName, model.options)),
        ];
        this.setRelativePath();
        return this;
    }

    public fromRef(options: Options, refName: string): OaImport {
        this.refName = refName;
        this.typeName = unqualifiedName(refName, options);
        this.qualifiedName = qualifiedName(refName, options);
        this.useAlias = this.typeName !== this.qualifiedName;
        [this.namespace, this.fileName] = [namespace(refName), fileName(unqualifiedName(refName, options))];
        this.setRelativePath();
        return this;
    }

    public fromImport(source: OaImport): OaImport {
        this.refName = source.refName;
        this.typeName = source.typeName;
        this.qualifiedName = source.qualifiedName;
        this.useAlias = false;
        [this.namespace, this.fileName] = [source.namespace, source.fileName];
        this.setRelativePath();
        return this;
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

    private setRelativePath(): void {
        this.file = (this.namespace ? `${this.namespace}/` : '') + this.fileName;
    }
}
