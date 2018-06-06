let language = '';
let languages = [];
let translation = {};

if (process.env.MODE == "client") {
  language = (window as any).__LANGUAGE__;
  translation = (window as any).__TRANSLATION__;
  languages = (window as any).__LANGUAGES__;
}

export function setState(_language, _languages, _translation) {
  language = _language;
  languages = _languages;
  translation = _translation;
}

export function setLanguage(lang) {
  language = lang;
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
  }
  else {
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