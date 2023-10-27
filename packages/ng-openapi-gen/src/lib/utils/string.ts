import { camelCase, deburr, kebabCase, upperFirst } from './lo/index.js';

export function trimLeadingSlash(input: string): string {
    return input.startsWith('/') || input.startsWith('\\') ? input.slice(1) : input;
}

export function trimTrailingSlash(input: string): string {
    return input.endsWith('/') || input.endsWith('\\') ? input.slice(0, -1) : input;
}

export function getFileNameIfExt(fileName: string, ext: string): string | null {
    return fileName.endsWith(ext) ? fileName.slice(0, fileName.length - ext.length) : null;
}

export function normalizeLineBreaks(input: string): string {
    return input.replace(/\r\n|\r|\n/g, '\n');
}

/**
 * Returns the namespace path, that is, the part before the last '.' split by '/' instead of '.'.
 * If there's no namespace, returns undefined.
 */
export function namespace(refPath: string): string | undefined {
    const name = refPath.replace(/^\.+/g, '').replace(/\.+$/g, '');
    const pos = name.lastIndexOf('.');
    return pos < 0 ? undefined : name.slice(0, pos).replace(/\./g, '/');
}

/**
 * Converts a text to a basic, letters / numbers / underscore representation.
 * When firstNonDigit is true, prepends the result with an underscore if the first char is a digit.
 */
export function toBasicChars(input: string, firstNonDigit = false): string {
    const text = deburr((input || '').trim()).replace(/\W+/g, '_');
    return firstNonDigit && /\d/.test(text.charAt(0)) ? '_' + text : text;
}

/** Returns the type (class) name for a given regular name */
export function typeName(name: string): string {
    return upperFirst(methodName(name));
}

/**
 * Returns a suitable method name for the given name
 * @param name The raw name
 */
export function methodName(name: string): string {
    return camelCase(toBasicChars(name, true));
}

/** Returns the file name for a given type name */
export function fileName(text: string): string {
    return kebabCase(toBasicChars(text));
}

/** Returns the reference name, that is, the last part after '/' */
export function refName(fullRef: string): string {
    return fullRef.slice(fullRef.lastIndexOf('/') + 1);
}

/** Escapes the name of a property / parameter if not valid JS identifier */
export function escapeId(name: string) {
    return /^[A-Za-z]\w*$/.test(name) ? name : `'${name.replace(/'/g, "\\'")}'`;
}

/** Returns the TypeScript comments for the given schema description, in a given indentation level */
export function tsComments(description: string | undefined, level: number, deprecated?: boolean): string {
    const indent = '  '.repeat(level);
    if (description === undefined || description.length === 0) {
        return indent + (deprecated ? '/** @deprecated */' : '');
    }
    const lines = description.trim().split('\n');
    let result = '\n' + indent + '/**\n';
    for (const line of lines) {
        result += indent + ' *' + (line === '' ? '' : ' ' + line.replace(/\*\//g, '* / ')) + '\n';
    }
    if (deprecated) {
        result += indent + ' *\n' + indent + ' * @deprecated\n';
    }
    result += indent + ' */\n' + indent;
    return result;
}
