export function processUrl(url: string): string {
    return url.replace(/^((http|https):\/\/[\w\.:]+\/)|^(\/)/, '')
}