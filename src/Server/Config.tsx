import * as fs from 'fs';
import * as path from 'path';

import * as Translation from '../Modules/Translation';
import { mapReduce, parseEnv } from './Lib/Config';
import defaultConfig from './DefaultConfig';

let configPath = path.resolve(process.env.CONFIG_PATH || './reiso.json');
let scope = process.env.SCOPE || 'default';

let config = JSON.parse(JSON.stringify(defaultConfig));

export function getConfig() {
  return config[scope];
}

let translations: any = {};

function setTranslation(config: {
  [name: string]: {
    languages: any[]
    defaultLanguage: string
    translation: string
  }
}) {
  if (config[scope].languages) {
    try {
      let translation = JSON.parse(fs.readFileSync(path.resolve(config[scope].translation), "utf8"));
      translations = mapReduce(config[scope].languages, translation);
    } catch (e) {
      translations = {}
    }

    Translation.setState(config[scope].defaultLanguage, config[scope].languages, translations);
  }
}

export function setConfig(newConfig) {
  config = Object.assign(config, JSON.parse(parseEnv(JSON.stringify(newConfig))));
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