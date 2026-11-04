import transliterate from '@sindresorhus/transliterate';
import { camelCase as baseCamelCase, constantCase, kebabCase as baseKebabCase } from 'change-case';

/**
 * ASCII that `transliterate` leaves untouched. `^` and `` ` `` are excluded because they count as
 * diacritics, so `transliterate` strips them.
 */
const UNCHANGED_BY_TRANSLITERATE = /^[\x00-\x5D\x5F\x61-\x7F]*$/;

const transliterated = new Map<string, string>();

/**
 * `transliterate` rebuilds its ~2000 entry table and one RegExp per entry on every call, which made it
 * the most expensive part of generation. Names repeat often and are nearly always plain ASCII.
 */
export function deburr(input: string): string {
    const text = input ?? '';
    if (UNCHANGED_BY_TRANSLITERATE.test(text)) {
        return text;
    }
    let result = transliterated.get(text);
    if (result === undefined) {
        result = transliterate(text);
        transliterated.set(text, result);
    }
    return result;
}

export function camelCase(input: string): string {
    return baseCamelCase(normalizeCaseInput(input)).replace(/_(\d)/g, '$1');
}

export function kebabCase(input: string): string {
    return baseKebabCase(normalizeCaseInput(input));
}

export function upperCase(input: string): string {
    return constantCase(normalizeCaseInput(input)).replace(/_/g, ' ');
}

export function upperFirst(input: string): string {
    if (!input) {
        return input;
    }
    return input.charAt(0).toUpperCase() + input.slice(1);
}

function normalizeCaseInput(input: string): string {
    return (input ?? '').replace(/([A-Za-z])(\d)/g, '$1 $2').replace(/(\d)([A-Za-z])/g, '$1 $2');
}
