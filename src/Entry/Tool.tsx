import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Server/Log';

import { translation, awalableLanguages } from '../Modules/Config';
import { configValidator } from '../Modules/Validator';

let validate = configValidator(getConfig(), {
  languages: awalableLanguages
})

if (validate.length) {
  throw new Error('Config is not valid: ' + validate.map(e => typeof(e) === 'string' ? e : e.message).join('; ') + ';');
}

import * as Translation from '../Modules/Translation';
Translation.setState(getConfig().defaultLanguage, getConfig().languages, translation);

import * as ORM from '../Modules/ORM';
import * as Tool from '../Modules/Tool';

import { Commander } from '../Server/Commander';

export const run = () => {
  const commander = new Commander(Tool.commands);
  commander.cycle();
}