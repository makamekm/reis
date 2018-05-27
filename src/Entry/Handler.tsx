require("source-map-support").install();
require("fetch-everywhere");

process.env.MODE = 'server';

import * as cluster from 'cluster';
import * as os from 'os';

let scope: any = process.env.HANDLER_SCOPE || 'Main';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Modules/Log';
Log.init();

import * as ORM from '../Modules/ORM';
import * as Handler from '../Modules/Handler';

export const run = () => {
  if (!getConfig().cores) {
    const cronManager = new Handler.JobManager(scope);
    cronManager.init();
  } else {
    if (cluster.isMaster) {
      const numCPUs = getConfig().cores == 'auto' ? os.cpus().length : getConfig().cores;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        Log.logWarn('Worker ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      cluster.on('listening', function(worker, address) {
        Log.logInfo('Worker started with PID ' + worker.process.pid + '.');
      });
    } else {
      const cronManager = new Handler.JobManager(scope);
      cronManager.init();
    }
  }
}