import { rsAstralRange, rsRegional, rsSequence, rsSurrPair } from './unicode-support.js';

/** Used to compose unicode character classes. */
const rsDingbatRange = '\\u2700-\\u27bf';
const rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
const rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
const rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
const rsPunctuationRange = '\\u2000-\\u206f';
const rsSpaceRange =
    ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
const rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
const rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

/** Used to compose unicode capture groups. */
const rsAposMark = "['\u2019]";
const rsBreakMark = `[${rsBreakRange}]`;
const rsDigit = '\\d';
const rsDingbatMark = `[${rsDingbatRange}]`;
const rsLowerMark = `[${rsLowerRange}]`;
const rsMiscMark = `[^${rsAstralRange}${rsBreakRange + rsDigit + rsDingbatRange + rsLowerRange + rsUpperRange}]`;
const rsUpperMark = `[${rsUpperRange}]`;

/** Used to compose unicode regexes. */
const rsMiscLowerGroup = `(?:${rsLowerMark}|${rsMiscMark})`;
const rsMiscUpperGroup = `(?:${rsUpperMark}|${rsMiscMark})`;
const rsOptContrLowerGroup = `(?:${rsAposMark}(?:d|ll|m|re|s|t|ve))?`;
const rsOptContrUpperGroup = `(?:${rsAposMark}(?:D|LL|M|RE|S|T|VE))?`;
const rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])';
const rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])';
const rsEmoji = `(?:${[rsDingbatMark, rsRegional, rsSurrPair].join('|')})${rsSequence}`;

const reUnicodeWords = new RegExp(
    [
        `${rsUpperMark}?${rsLowerMark}+${rsOptContrLowerGroup}(?=${[rsBreakMark, rsUpperMark, '$'].join('|')})`,
        `${rsMiscUpperGroup}+${rsOptContrUpperGroup}(?=${[rsBreakMark, rsUpperMark + rsMiscLowerGroup, '$'].join(
            '|',
        )})`,
        `${rsUpperMark}?${rsMiscLowerGroup}+${rsOptContrLowerGroup}`,
        `${rsUpperMark}+${rsOptContrUpperGroup}`,
        rsOrdUpper,
        rsOrdLower,
        `${rsDigit}+`,
        rsEmoji,
    ].join('|'),
    'g',
);

/** Splits a Unicode `string` into an array of its words. */
export function unicodeWords(input: string): string[] {
    return input.match(reUnicodeWords);
}
