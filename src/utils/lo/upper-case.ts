import { words } from './words.js';

/**
 * Converts `string`, as space separated words, to upper case.
 *
 * upperCase('--foo-bar') // => 'FOO BAR'
 * upperCase('fooBar') // => 'FOO BAR'
 * upperCase('__foo_bar__') // => 'FOO BAR'
 */
export const upperCase = (input: string): string =>
    words((typeof input === 'string' ? input : `${input}`).replace(/['\u2019]/g, '')).reduce(
        (result, word, index) => result + (index ? ' ' : '') + word.toUpperCase(),
        '',
    );
