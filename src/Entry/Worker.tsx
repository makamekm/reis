import * as cron from 'cron';

function trim(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp(
    "^[" + c + "]+|[" + c + "]+$", "g"
  ), "");
}

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.argv.find(s => s.indexOf('scope=') == 0);
if (scope) scope = trim(scope.substring(6), '"');

let silent = !!process.argv.find(s => s.indexOf('silent') == 0);

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
import { Commander } from '../Server/Commander';
import * as Worker from '../Modules/Worker';

export const run = () => {
  const cronManager = new Worker.CronManager(scope || 'Main');
  cronManager.init();

  if (!silent) {
    let commands = {
      status: {
        description: Translation.transDefault('Cron.GetStatusDescription'),
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist'));
          }
          callback();
        })
      },
      stop: {
        description: Translation.transDefault('Cron.StopDescription'),
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
            console.log(Translation.transDefault('Cron.Stopping'));
            cronManager.stop(answer).then(() => {
              console.log(Translation.transDefault('Cron.Stoped'));
              callback();
            }).catch(e => {
              console.log(Translation.transDefault("StopFailed"));
              console.error(e);
              callback();
            });
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist'));
            callback();
          }
        })
      },
      start: {
        description: Translation.transDefault('Cron.StartDescription'),
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
            cronManager.start(answer);
            console.log(Translation.transDefault('Cron.Started'));
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist'));
          }
          callback();
        })
      },
      names: {
        description: Translation.transDefault('Cron.GetNamesDescription'),
        action: (read, callback) => {
          cronManager.getNames().forEach(name => console.log(name));
          callback();
        }
      }
    }

    const commander = new Commander(commands);
    commander.cycle();
  }
}