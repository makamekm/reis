import * as cluster from 'cluster';
import * as os from 'os';
const monitoring = require('appmetrics')

const isMulticore: any = !!process.env.MULTI;

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Server/Log';
import * as Server from '../Server/Server';

export function run() {
  var monitoringConfig = getConfig().monitoring && {
    hosts: getConfig().monitoring.hosts,
    index: getConfig().monitoring.index,
    applicationName: getConfig().monitoring.name
  };

  if (!isMulticore) {
    if (monitoringConfig) monitoring.monitor(monitoringConfig);
    const app = new Server.Server();
    app.start();
  } else {
    if (cluster.isMaster) {
      if (monitoringConfig) monitoring.monitor(monitoringConfig);

      const numCPUs = os.cpus().length;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        Log.logInfo('Worker ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      cluster.on('listening', function(worker, address) {
        Log.logInfo('Worker started with PID ' + worker.process.pid + '.');
      });
    } else {
      const app = new Server.Server();
      app.start();
    }
  }
}