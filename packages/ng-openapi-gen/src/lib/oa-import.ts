import { Options } from './options.js';
import { modelFile, qualifiedName, unqualifiedName } from './utils/open-api.js';

export class OaImport {
    public name: string;
    public typeName: string;
    public qualifiedName: string;
    public file: string;
    public useAlias: boolean;

    constructor(name: string, pathToModels: string, options: Options) {
        this.name = name;
        this.typeName = unqualifiedName(name, options);
        this.qualifiedName = qualifiedName(name, options);
        this.useAlias = this.typeName !== this.qualifiedName;
        this.file = modelFile(pathToModels, name, options);
    }
}
