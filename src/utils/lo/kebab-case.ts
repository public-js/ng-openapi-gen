import { words } from './words.js';

/**
 * Converts `string` to
 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
 *
 * kebabCase('Foo Bar') // => 'foo-bar'
 * kebabCase('fooBar') // => 'foo-bar'
 * kebabCase('__FOO_BAR__') // => 'foo-bar'
 */
export const kebabCase = (input: string): string =>
    words((typeof input === 'string' ? input : `${input}`).replace(/['\u2019]/g, '')).reduce(
        (result, word, index) => result + (index ? '-' : '') + word.toLowerCase(),
        '',
    );
