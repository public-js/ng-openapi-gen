declare module 'yargs-parser' {
    export interface Options {
        string?: string[];
        number?: string[];
        boolean?: string[];
        array?: Array<string | { key: string; number?: true }>;
        alias?: Record<string, string>;
        configuration?: Record<string, unknown>;
    }

    export default function yargsParser(args: string[], options?: Options): Record<string, unknown>;
}
