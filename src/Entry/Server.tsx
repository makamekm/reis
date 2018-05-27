require("source-map-support").install();
require("fetch-everywhere");

process.env.MODE = 'server';

import * as cluster from 'cluster';
import * as os from 'os';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Server/Log';
import * as Server from '../Server/Server';

export function run() {
  if (!getConfig().cores) {
    const app = new Server.Server();
    app.start();
  } else {
    if (cluster.isMaster) {
      const numCPUs = getConfig().cores == 'auto' ? os.cpus().length : getConfig().cores;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        Log.logWarn('Thread ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      cluster.on('listening', function(worker, address) {
        Log.logInfo('Thread started with PID ' + worker.process.pid + '.');
      });
    } else {
      const app = new Server.Server();
      app.start();
    }
  }
}