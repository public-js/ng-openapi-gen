import { defaultOptions, Options } from './options.js';
import { fileName } from './utils/string.js';

export class Globals {
    public configurationClass: string;
    public configurationFile: string;
    public configurationParams: string;
    public baseServiceClass: string;
    public baseServiceFile: string;
    public requestBuilderClass: string;
    public requestBuilderFile: string;
    public responseClass: string;
    public responseFile: string;
    public moduleClass?: string;
    public moduleFile?: string;
    public modelIndexFile?: string;
    public serviceIndexFile?: string;
    public rootUrl?: string;

    constructor(options: Options) {
        this.configurationClass = options.configuration;
        this.configurationFile = fileName(this.configurationClass);
        this.configurationParams = `${this.configurationClass}Params`;
        this.baseServiceClass = options.baseService;
        this.baseServiceFile = fileName(this.baseServiceClass);
        this.requestBuilderClass = options.requestBuilder;
        this.requestBuilderFile = fileName(this.requestBuilderClass);
        this.responseClass = options.response;
        this.responseFile = fileName(this.responseClass);

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
    }
}
