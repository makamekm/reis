import * as cluster from 'cluster';
import * as os from 'os';

let scope: any = process.env.HANDLER_SCOPE || 'Main';
let isMulticore: any = !!process.env.MULTI;

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Server/Log';
import * as ORM from '../Modules/ORM';
import * as Handler from '../Modules/Handler';

export const run = () => {
  if (!isMulticore) {
    const cronManager = new Handler.JobManager(scope);
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
      const cronManager = new Handler.JobManager(scope);
      cronManager.init();
    }
  }
}