import {
    rsAstralMark,
    rsComboMark,
    rsFitz,
    rsNonAstralMark,
    rsRegional,
    rsSequence,
    rsSurrPair,
} from './unicode-support.js';

/** Used to compose unicode regexes. */
const rsNonAstralCombo = `${rsNonAstralMark}${rsComboMark}?`;
const rsSymbol = `(?:${[rsNonAstralCombo, rsComboMark, rsRegional, rsSurrPair, rsAstralMark].join('|')})`;

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
const reUnicode = new RegExp(`${rsFitz}(?=${rsFitz})|${rsSymbol + rsSequence}`, 'g');

/** Converts a Unicode `string` to an array. */
export function unicodeToArray(input: string): string[] {
    return input.match(reUnicode) || [];
}
