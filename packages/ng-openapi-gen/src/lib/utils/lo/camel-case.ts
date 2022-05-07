import { upperFirst } from './upper-first.js';
import { words } from './words.js';

/**
 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
 *
 * camelCase('Foo Bar') // => 'fooBar'
 * camelCase('--foo-bar--') // => 'fooBar'
 * camelCase('__FOO_BAR__') // => 'fooBar'
 */
export const camelCase = (input: string): string =>
    words((typeof input === 'string' ? input : `${input}`).replace(/['\u2019]/g, '')).reduce((result, word, index) => {
        word = word.toLowerCase();
        return result + (index ? upperFirst(word) : word);
    }, '');
