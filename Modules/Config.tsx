import * as fs from 'fs';
import * as path from 'path';

function reduce(language, row): any {
  let finish = true;
  let res = Object.assign({}, row);

  for (let key in res) {
    if (typeof res[key] == 'object') {
      finish = false;
      res[key] = reduce(language, res[key]);
    }
  }

  if (finish) return res[language]
  else return res;
}

export const reifConfig = JSON.parse(fs.readFileSync(path.resolve('./reiso.json'), "utf8"));
export function getReifConfig() {
  return reifConfig;
}

let configPath = path.resolve(reifConfig.config);

export let translation: any = {};
let config: any = {};
export const awalableLanguages = reifConfig.languages;

// let data = require('~/translation.json');
let data = JSON.parse(fs.readFileSync(path.resolve(reifConfig.translation), "utf8"));
data = JSON.parse(JSON.stringify(data));

function trim(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}

export function getConfig() {
  return config;
}

export function readConfig() {

  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  catch (e) {}

  config = Object.assign(reifConfig.default, config);

  config['languages'].forEach(language => {
    translation[language] = reduce(language, data);
  });
}

export const SaveConfig = (config) => {
  if (fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    encoding: 'utf8'
  })
  else fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    encoding: 'utf8',
    flag: 'wx'
  });
}

export const existConfig = () => {
  return fs.existsSync(configPath);
}