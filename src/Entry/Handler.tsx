import * as cluster from 'cluster';
import * as os from 'os';

function trim(s, c) {
  if (c === "]") c = "\\]";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp(
    "^[" + c + "]+|[" + c + "]+$", "g"
  ), "");
}

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let cores: any = process.argv.find(s => s.indexOf('cores=') == 0);
if (cores) cores = Number(trim(cores.substring(6), '"'));

let scope: any = process.argv.find(s => s.indexOf('scope=') == 0);
if (scope) scope = trim(scope.substring(6), '"');

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
import * as Handler from '../Modules/Handler';

export const run = () => {
  if (cores == 1) {
    const cronManager = new Handler.JobManager(scope || 'Main');
    cronManager.init();
  }
  else {

    if (cluster.isMaster) {

      let numCPUs = cores || os.cpus().length;

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      // If a worker dies, log it to the console and start another worker.
      cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      // Log when a worker starts listening
      cluster.on('listening', function(worker, address) {
        console.log('Worker started with PID ' + worker.process.pid + '.');
      });

    } else {
      const cronManager = new Handler.JobManager();
      cronManager.init();
    }
  }
}