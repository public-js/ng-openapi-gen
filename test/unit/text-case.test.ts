import transliterate from '@sindresorhus/transliterate';
import { describe, expect, test } from 'vitest';

import { deburr } from '../../src/utils/text-case.js';

describe('deburr', () => {
    test('matches transliterate for every ASCII character', () => {
        for (let code = 0; code < 128; code++) {
            const text = `a${String.fromCharCode(code)}b`;
            expect(deburr(text), `char code ${code}`).toBe(transliterate(text));
        }
    });

    test('transliterates non-ASCII text, including on repeated calls', () => {
        expect(deburr('Crème Brûlée')).toBe('Creme Brulee');
        expect(deburr('Crème Brûlée')).toBe('Creme Brulee');
        expect(deburr('Привет')).toBe(transliterate('Привет'));
    });

    test('treats a missing value as empty', () => {
        expect(deburr(undefined as unknown as string)).toBe('');
    });
});
