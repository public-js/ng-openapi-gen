import { OaContent } from './oa-content.js';
import { Options } from './options.js';

export class OaResponse {
    constructor(
        public statusCode: string,
        public description: string,
        public content: OaContent[],
        public options: Options,
    ) {}
}
