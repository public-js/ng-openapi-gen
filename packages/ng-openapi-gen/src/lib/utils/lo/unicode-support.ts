/** Used to compose unicode character classes. */
export const rsAstralRange = '\\ud800-\\udfff';
const rsComboMarksRange = '\\u0300-\\u036f';
const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
const rsComboSymbolsRange = '\\u20d0-\\u20ff';
const rsComboMarksExtendedRange = '\\u1ab0-\\u1aff';
const rsComboMarksSupplementRange = '\\u1dc0-\\u1dff';

export const rsComboRange =
    rsComboMarksRange +
    reComboHalfMarksRange +
    rsComboSymbolsRange +
    rsComboMarksExtendedRange +
    rsComboMarksSupplementRange;
export const rsComboMark = `[${rsComboRange}]`;

export const rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
export const rsFitz = '\\ud83c[\\udffb-\\udfff]';
export const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
export const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
export const rsZWJ = '\\u200d';

export const rsAstralMark = `[${rsAstralRange}]`;
export const rsNonAstralMark = `[^${rsAstralRange}]`;
const rsComboFitzMark = `(?:${rsComboMark}|${rsFitz})`;
export const rsComboFitzOptionalMark = `${rsComboFitzMark}?`;
const rsVarOptionalMark = `[${rsVarRange}]?`;
const rsOptionalJoinGroup = `(?:${rsZWJ}(?:${[rsNonAstralMark, rsRegional, rsSurrPair].join('|')})${
    rsVarOptionalMark + rsComboFitzOptionalMark
})*`;
export const rsSequence = rsVarOptionalMark + rsComboFitzOptionalMark + rsOptionalJoinGroup;
