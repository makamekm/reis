import * as cluster from 'cluster';
import * as os from 'os';
import * as cron from 'cron';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.env.WORKER_SCOPE;
let isMulticore: any = !!process.env.MULTI;

import * as Log from '../Server/Log';
import * as Worker from '../Modules/Worker';
import * as Translation from '../Modules/Translation';

export const run = () => {
  if (!isMulticore) {
    const cronManager = new Worker.CronManager(scope);
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
        Log.logInfo('Worker ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      // Log when a worker starts listening
      cluster.on('listening', function(worker, address) {
        Log.logInfo('Worker started with PID ' + worker.process.pid + '.');
      });

    } else {
      const cronManager = new Worker.CronManager(scope);
      cronManager.init();
    }
  }
}