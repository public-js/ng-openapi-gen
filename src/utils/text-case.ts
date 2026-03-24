import transliterate from '@sindresorhus/transliterate';
import { camelCase as baseCamelCase, constantCase, kebabCase as baseKebabCase } from 'change-case';

export function deburr(input: string): string {
    return transliterate(input ?? '');
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
    return (input ?? '')
        .replace(/([A-Za-z])(\d)/g, '$1 $2')
        .replace(/(\d)([A-Za-z])/g, '$1 $2');
}
