import jsesc from 'jsesc';

import { Options } from './options.js';
import { enumName } from './utils/open-api.js';

export class OaEnumValue {
    public name: string;
    public value: string;
    public description: string;

    constructor(
        public type: string,
        public options: Options,
        name: string | undefined,
        description: string | undefined,
        _value: unknown,
    ) {
        const value = String(_value);
        this.name = name || enumName(value, options);
        this.description = description || this.name;
        if (this.name === '') {
            this.name = '_';
        }
        if (this.description === '') {
            this.description = this.name;
        }
        this.value = type === 'string' ? `'${jsesc(value)}'` : value;
    }
}
