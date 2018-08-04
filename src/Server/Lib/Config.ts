export function reduce(language: string, translation): any {
    let finish = true;
    let res = Object.assign({}, translation);

    for (let key in res) {
        if (typeof res[key] == 'object') {
            finish = false;
            res[key] = reduce(language, res[key]);
        }
    }

    if (finish) return res[language];
    else return res;
}

export function mapReduce(languages: string[], translation): any {
    const map = {};
    languages.forEach(language => map[language] = reduce(language, translation));
    return map;
}

export function parseEnv(str: string) {
    let result: RegExpExecArray;

    while (result = /\$\{(\w+)\}/gi.exec(str)) {
        str = str.replace("${" + result[1] + "}", process.env[result[1]]);
    }

    while (result = /\$\{(\w+):(\w+)\}/gi.exec(str)) {
        str = str.replace("${" + result[1] + ":" + result[2] + "}", process.env[result[1]] || result[2]);
    }
    return str;
}