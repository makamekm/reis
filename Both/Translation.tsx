let language = '';
let languages = [];
let translation = {};

declare var window: {
  __LANGUAGE__: any
  __TRANSLATION__: any
  __LANGUAGES__: any
}

if (process.env.MODE == "client") {
  language = window.__LANGUAGE__;
  translation = window.__TRANSLATION__;
  languages = window.__LANGUAGES__;
}

export function setState(newLanguage, newLanguages, newTranslation) {
  language = newLanguage;
  languages = newLanguages;
  translation = newTranslation;
}

export function getLanguage() {
  return language;
}

export function getLanguages() {
  return languages;
}

export function getTranslation() {
  return translation;
}

function evaluate(obj: any, queries: string[], path: string): string {
  if (!queries.length) throw new Error('There is not translation for path: ' + path);
  let name = queries.shift();
  if (queries.length > 0) {
    return obj[name] ? evaluate(obj[name], queries, path) : '';
  } else {
    return obj[name] || '';
  }
}

export function trans(lang: string, query: string, ...args: string[]): string {
  if (!lang) lang = language;
  let str = evaluate(translation[lang] || {}, query.split('.'), query);
  for (var i in args) {
    str = str.replace('$' + i + '$', args[i]);
  }
  return str;
}

export function transDefault(query: string, ...args: string[]): string {
  let str = evaluate(translation[language] || {}, query.split('.'), query);
  for (var i in args) {
    str = str.replace('$' + i + '$', args[i]);
  }
  return str;
}