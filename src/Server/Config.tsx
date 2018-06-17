import * as fs from 'fs';
import * as path from 'path';

import * as Translation from '../Modules/Translation';
import { reduce, parseEnv } from './Lib/Config';
import defaultConfig from './DefaultConfig';

let configPath = path.resolve(process.env.CONFIG_PATH || './reiso.json');
let scope = process.env.SCOPE || 'default';

let config = JSON.parse(JSON.stringify(defaultConfig));

export function getConfig() {
  return config[scope];
}

const translation: any = {};

function setTranslation(config) {
  if (config[scope].languages) {
    try {
      let data = JSON.parse(fs.readFileSync(path.resolve(config[scope].translation), "utf8"));

      config[scope].languages.forEach(language => {
        translation[language] = reduce(language, data);
      });
    }
    catch (e) {}

    Translation.setState(config[scope].defaultLanguage, config[scope].languages, translation);
  }
}

export function setConfig(_config) {
  config = Object.assign(config, JSON.parse(parseEnv(JSON.stringify(_config))));
  setTranslation(config);
}

export function readConfig() {
  try {
    if (fs.existsSync(configPath)) config = Object.assign(config, JSON.parse(parseEnv(fs.readFileSync(configPath, "utf8"))));
  } catch (e) {}
  setTranslation(config);
}

export const saveConfig = (config) => {
  if (fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    encoding: 'utf8'
  })
  else fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    encoding: 'utf8',
    flag: 'wx'
  });
}