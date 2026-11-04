import { OaContent } from './oa-content.js';

export class OaResponse {
    constructor(
        public statusCode: string,
        public description: string,
        public content: OaContent[],
    ) {}
}
