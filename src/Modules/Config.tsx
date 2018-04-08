import * as fs from 'fs';
import * as path from 'path';

let configPath = path.resolve(process.env.CONFIG_PATH || './reiso.json');
let scope = process.env.SCOPE || 'default';

function reduce(language, row): any {
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

export let translation: any = {};
export let awalableLanguages = [];
let config: any = {
  default: {
    "translation": "./translation.json",
    "languages": ["en"],
    "defaultLanguage": "en",
    "maxFileSize": 50,
    "publicDir": "./public",
    "uploadDir": "./uploads",
    "port": 3000,
    "portWS": 5000,
    "host": "127.0.0.1",
    "globalPort": 3000,
    "globalPortWS": 5000,
    "seaportHost": null,
    "seaportPort": null,
    "logPath": null,
    "logConsole": null,
    "logLogstash": null,
    "ddos": null,
    "db": {
      "Main": {
        "database": "test",
        "extra": {
          "charset": "utf8_general_ci"
        },
        "host": "localhost",
        "password": "",
        "port": 3306,
        "type": "mysql",
        "username": "root"
      }
    },
    "redisPubSub": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    },
    "redisJob": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": "",
        "scope": 'cb_subscription'
      }
    },
    "redis": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    }
  }
};

export function getConfig() {
  return config[scope];
}

export function readConfig() {
  try {
    if (fs.existsSync(configPath)) config = Object.assign(config, JSON.parse(fs.readFileSync(configPath, "utf8")));
  }
  catch (e) {}

  try {
    if (process.env.CONFIG) config = Object.assign(config[scope], JSON.parse(process.env.CONFIG));
  }
  catch (e) {}

  awalableLanguages = config[scope].languages;

  try {
    let data = JSON.parse(fs.readFileSync(path.resolve(config[scope].translation), "utf8"));

    config[scope]['languages'].forEach(language => {
      translation[language] = reduce(language, data);
    });
  }
  catch (e) {}
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