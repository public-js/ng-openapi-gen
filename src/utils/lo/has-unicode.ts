import { rsAstralRange, rsComboRange, rsVarRange, rsZWJ } from './unicode-support.js';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
// eslint-disable-next-line no-misleading-character-class
const reHasUnicode = new RegExp(`[${rsZWJ + rsAstralRange + rsComboRange + rsVarRange}]`);

/** Checks if `string` contains Unicode symbols. */
export function hasUnicode(input: string): boolean {
    return reHasUnicode.test(input);
}
