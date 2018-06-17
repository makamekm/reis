export function reduce(language: string, row): any {
    let finish = true;
    let res = Object.assign({}, row);

    for (let key in res) {
        if (typeof res[key] == 'object') {
            finish = false;
            res[key] = reduce(language, res[key]);
        }
    }

    if (finish) return res[language];
    else return res;
}

export function parseEnv(str: string) {
    let result: RegExpExecArray;

    while (result = /\$\{(\w+)\}/gi.exec(str)) {
        str = str.replace("${" + result[1] + "}", process.env[result[1]]);
    }
    return str;
}