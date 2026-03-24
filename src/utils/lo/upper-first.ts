import { hasUnicode } from './has-unicode.js';
import { unicodeToArray } from './unicode-to-array.js';

/** Converts `string` to an array. */
function stringToArray(input: string): string[] {
    return hasUnicode(input) ? unicodeToArray(input) : input.split('');
}

/**
 * Converts the first character of `string` to upper case.
 *
 * upperFirst('fred') // => 'Fred'
 * upperFirst('FRED') // => 'FRED'
 */
export function upperFirst(input: string): string {
    if (!input) {
        return '';
    }
    if (hasUnicode(input)) {
        const symbols = stringToArray(input);
        return symbols[0].toUpperCase() + symbols.slice(1).join('');
    }
    return input[0].toUpperCase() + input.slice(1);
}
