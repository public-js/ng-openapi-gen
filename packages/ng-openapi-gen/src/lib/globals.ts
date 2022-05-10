import { defaultOptions, Options } from './options.js';
import { fileName, tsComments } from './utils/string.js';

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
    public rootUrl?: string;

    constructor(options: Options) {
        this.configurationFile = options.configurationFile;
        this.rootUrlToken = options.rootUrlToken;
        this.requestBuilderClass = options.requestBuilder;
        this.requestBuilderFile = fileName(this.requestBuilderClass);
        this.responseClass = options.response;
        this.pathToModelsDir = `./${options.modelsDir}/`;
        this.pathToServicesDir = `./${options.servicesDir}/`;

        if (options.module !== false && options.module !== '') {
            this.moduleClass = typeof options.module === 'string' ? options.module : (defaultOptions.module as string);
            this.moduleFile = fileName(this.moduleClass as string).replace(/-module$/, '.module');
        }

        if (options.serviceIndex !== false && options.serviceIndex !== '') {
            this.serviceIndexFile =
                typeof options.serviceIndex === 'string'
                    ? options.serviceIndex
                    : (defaultOptions.serviceIndex as string);
        }

        if (options.modelIndex !== false && options.modelIndex !== '') {
            this.modelIndexFile =
                typeof options.modelIndex === 'string' ? options.modelIndex : (defaultOptions.modelIndex as string);
        }

        this.autoGenerationNotice = tsComments(
            [
                'This file was generated automatically from API specification.',
                'Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.',
                'To update this file run the generation tool.',
            ].join('\n'),
            0,
        );
    }
}
