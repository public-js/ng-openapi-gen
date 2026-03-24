import { unicodeWords } from './unicode-words.js';

// eslint-disable-next-line unicorn/better-regex
// const hasUnicodeWord = RegExp.prototype.test.bind(/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/);

// eslint-disable-next-line unicorn/better-regex
const reUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line unicorn/no-hex-escape,no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

/**
 * Splits `string` into an array of its words.
 *
 * words('fred, barney, & pebbles') // => ['fred', 'barney', 'pebbles']
 * words('fred, barney, & pebbles', /[^, ]+/g) // => ['fred', 'barney', '&', 'pebbles']
 */
export function words(input: string, pattern?: RegExp | string): string[] {
    if (pattern === undefined) {
        const result = reUnicodeWord.test(input) ? unicodeWords(input) : input.match(reAsciiWord);
        return result || [];
    }
    return input.match(pattern) || [];
}
