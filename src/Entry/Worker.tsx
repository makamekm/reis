import * as cron from 'cron';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.env.SCOPE_GROUP;
let isCommander: any = process.env.COMMANDER;

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

  if (isCommander) {
    let commands = {
      status: {
        description: Translation.transDefault('Cron.GetStatusDescription') || "Get a status of a job",
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName') || "Enter the job's name: ", function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0')) || `Status: ${cronManager.status(answer) ? '1' : '0'}; Is running: ${cronManager.isRunning(answer) ? '1' : '0'}`;
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist') || "The job doesn't exist");
          }
          callback();
        })
      },
      stop: {
        description: Translation.transDefault('Cron.StopDescription') || "Stop a job by name",
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName') || "Enter the job's name: ", function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0') || `Status: ${cronManager.status(answer) ? '1' : '0'}; Is running: ${cronManager.isRunning(answer) ? '1' : '0'}`);
            console.log(Translation.transDefault('Cron.Stopping') || "Stopping...");
            cronManager.stop(answer).then(() => {
              console.log(Translation.transDefault('Cron.Stoped') || "Stoped!");
              callback();
            }).catch(e => {
              console.log(Translation.transDefault("StopFailed") || "Failed, but the jos has stopped!");
              console.error(e);
              callback();
            });
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist') || "The job doesn't exist");
            callback();
          }
        })
      },
      start: {
        description: Translation.transDefault('Cron.StartDescription'),
        action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
          if (cronManager.isJob(answer)) {
            console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0') || `Status: ${cronManager.status(answer) ? '1' : '0'}; Is running: ${cronManager.isRunning(answer) ? '1' : '0'}`);
            cronManager.start(answer);
            console.log(Translation.transDefault('Cron.Started') || "Stoped!");
          }
          else {
            console.log(Translation.transDefault('Cron.JobDeesntExist') || "The job doesn't exist");
          }
          callback();
        })
      },
      names: {
        description: Translation.transDefault('Cron.GetNamesDescription') || "Show all names of jobs",
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