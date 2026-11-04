import { camelCase, deburr, kebabCase, upperFirst } from './text-case.js';

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

/** Returns the text for a doc comment. Empty when there is nothing to document. */
export function docText(description = '', deprecated = false): string {
    const text = description
        .trim()
        .split('\n')
        .map((line) => line.replace(/\*\//g, '* / ').trimEnd())
        .join('\n');
    if (!deprecated) {
        return text;
    }
    return text ? `${text}\n\n@deprecated` : '@deprecated';
}

/** Returns a full doc comment, for places that are rendered as plain text */
export function tsComments(description: string, deprecated?: boolean): string {
    let result = '\n/**\n';
    for (const line of description.trim().split('\n')) {
        result += ' *' + (line === '' ? '' : ' ' + line.replace(/\*\//g, '* / ')) + '\n';
    }
    if (deprecated) {
        result += ' *\n * @deprecated\n';
    }
    return result + ' */\n';
}
