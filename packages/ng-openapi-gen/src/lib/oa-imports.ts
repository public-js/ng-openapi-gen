import { OaImport } from './oa-import.js';
import { Options } from './options.js';

export class OaImports {
    private _imports = new Map<string, OaImport>();

    constructor(private options: Options) {}

    public add(name: string, pathToModels: string) {
        this._imports.set(name, new OaImport(name, pathToModels, this.options));
    }

    public toArray(): OaImport[] {
        const keys = [...this._imports.keys()];
        keys.sort();
        return keys.map((k) => this._imports.get(k));
    }
}
