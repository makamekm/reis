export function distinct(tags: string[]): string[] {
    return tags.filter((elem, pos, arr) => arr.indexOf(elem) == pos);
}