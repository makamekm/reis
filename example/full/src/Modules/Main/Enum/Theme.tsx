export type Theme = 'dark' | 'light';

export function ThemeStringify(type: Theme) {
    if (type == 'dark') return 'Dark';
    if (type == 'light') return 'Light';
    return 'Default';
}