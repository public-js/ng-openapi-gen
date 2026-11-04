import { defaultOptions, Options } from '../../config/options.js';
import { fileName, tsComments } from '../../utils/string.js';

export class Globals {
    public configurationFile: string;
    public rootUrlToken: string;
    public requestBuilderClass: string;
    public requestBuilderFile: string;
    public responseClass: string;
    public pathToModelsDir: string;
    public pathToServicesDir: string;
    public autoGenerationNotice: string;
    public moduleClass?: string;
    public moduleFile?: string;
    public modelIndexFile?: string;
    public serviceIndexFile?: string;
    public includePrettier?: boolean;

    constructor(options: Options) {
        this.configurationFile = options.configurationFile;
        this.rootUrlToken = options.rootUrlToken;
        this.requestBuilderClass = options.requestBuilder;
        this.requestBuilderFile = fileName(this.requestBuilderClass);
        this.responseClass = options.response;
        this.pathToModelsDir = `./${options.modelsDir}/`;
        this.pathToServicesDir = `./${options.servicesDir}/`;
        this.includePrettier = options.runPrettier;

        this.moduleClass = optionalName(options.module, defaultOptions.module);
        this.moduleFile = this.moduleClass && fileName(this.moduleClass).replace(/-module$/, '.module');
        this.serviceIndexFile = optionalName(options.serviceIndex, defaultOptions.serviceIndex);
        this.modelIndexFile = optionalName(options.modelIndex, defaultOptions.modelIndex);

        this.autoGenerationNotice = tsComments(
            [
                'This file was generated automatically from the API specification.',
                'Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.',
                'To update this file, run the generation tool.',
            ].join('\n'),
        );
    }
}

/** Resolves a `string | boolean` option: `false` or empty disables the file and `true` selects the default name. */
function optionalName(value: string | boolean, defaultName: string | boolean): string | undefined {
    if (value === false || value === '') {
        return undefined;
    }
    return String(value === true ? defaultName : value);
}
