require("source-map-support").install();
require("fetch-everywhere");

process.env.MODE = 'server';

import * as cluster from 'cluster';
import * as os from 'os';
import * as cron from 'cron';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.env.WORKER_SCOPE;

import * as Log from '../Server/Log';
import * as Worker from '../Modules/Worker';
import * as Translation from '../Modules/Translation';

export const run = () => {
  if (!getConfig().cores) {
    const cronManager = new Worker.CronManager(scope);
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
      const cronManager = new Worker.CronManager(scope);
      cronManager.init();
    }
  }
}