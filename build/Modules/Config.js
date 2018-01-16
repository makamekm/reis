"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function reduce(language, row) {
    let finish = true;
    let res = Object.assign({}, row);
    for (let key in res) {
        if (typeof res[key] == 'object') {
            finish = false;
            res[key] = reduce(language, res[key]);
        }
    }
    if (finish)
        return res[language];
    else
        return res;
}
exports.reifConfig = JSON.parse(fs.readFileSync(path.resolve('./reiso.json'), "utf8"));
function getReifConfig() {
    return exports.reifConfig;
}
exports.getReifConfig = getReifConfig;
let configPath = path.resolve(exports.reifConfig.config);
exports.translation = {};
let config = {};
exports.awalableLanguages = exports.reifConfig.languages;
// let data = require('~/translation.json');
let data = JSON.parse(fs.readFileSync(path.resolve(exports.reifConfig.translation), "utf8"));
data = JSON.parse(JSON.stringify(data));
function trim(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
function getConfig() {
    return config;
}
exports.getConfig = getConfig;
function readConfig() {
    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    catch (e) { }
    config = Object.assign(exports.reifConfig.default, config);
    config['languages'].forEach(language => {
        exports.translation[language] = reduce(language, data);
    });
}
exports.readConfig = readConfig;
exports.SaveConfig = (config) => {
    if (fs.existsSync(configPath))
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
            encoding: 'utf8'
        });
    else
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
            encoding: 'utf8',
            flag: 'wx'
        });
};
exports.existConfig = () => {
    return fs.existsSync(configPath);
};
//# sourceMappingURL=Config.js.map