export function toDocs(tsComments: string): string[] {
    const trimmed = tsComments.trim();
    if (!trimmed.startsWith('/**')) {
        return [];
    }
    const inner = trimmed
        .replace(/^\/\*\*\n?/, '')
        .replace(/\n?\*\/$/, '')
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd());
    return [inner.join('\n').trim()];
}
