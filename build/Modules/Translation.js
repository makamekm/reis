"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let language = '';
let languages = [];
let translation = {};
if (process.env.MODE == "client") {
    language = window.__LANGUAGE__;
    translation = window.__TRANSLATION__;
    languages = window.__LANGUAGES__;
}
function setState(_language, _languages, _translation) {
    language = _language;
    languages = _languages;
    translation = _translation;
}
exports.setState = setState;
function setLanguage(lang) {
    language = lang;
}
exports.setLanguage = setLanguage;
function getLanguage() {
    return language;
}
exports.getLanguage = getLanguage;
function getLanguages() {
    return languages;
}
exports.getLanguages = getLanguages;
function getTranslation() {
    return translation;
}
exports.getTranslation = getTranslation;
function evaluate(obj, queries, path) {
    if (!queries.length)
        throw new Error('There is not translation for path: ' + path);
    let name = queries.shift();
    if (queries.length > 0) {
        return evaluate(obj[name], queries, path);
    }
    else {
        return obj[name];
    }
}
function trans(lang, query, ...args) {
    if (!lang)
        lang = language;
    let str = evaluate(translation[lang], query.split('.'), query);
    for (var i in args) {
        str = str.replace('$' + i + '$', args[i]);
    }
    return str;
}
exports.trans = trans;
function transDefault(query, ...args) {
    let str = evaluate(translation[language], query.split('.'), query);
    for (var i in args) {
        str = str.replace('$' + i + '$', args[i]);
    }
    return str;
}
exports.transDefault = transDefault;
//# sourceMappingURL=Translation.js.map