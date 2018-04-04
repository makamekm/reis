import * as cluster from 'cluster';
import * as os from 'os';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.env.SCOPE_GROUP;
let isMulticore: any = process.env.MULTI;

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
  if (!isMulticore) {
    const cronManager = new Handler.JobManager(scope || 'Main');
    cronManager.init();
  } else {

    if (cluster.isMaster) {

      let numCPUs = os.cpus().length;

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