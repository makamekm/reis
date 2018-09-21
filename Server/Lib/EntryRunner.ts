import * as cluster from 'cluster';
import * as os from 'os';

import * as Config from '../../Modules/Config';
import * as Log from '../../Modules/Log';

export const runCluster = (func: () => void, silent?: boolean) => {
  if (!silent) {
    Config.readConfig();
    Log.init();
  }

  if (!Config.getConfig().cores) {
    func();
  } else {
    if (cluster.isMaster) {
      const numCPUs = Config.getConfig().cores == 'auto' ? os.cpus().length : Config.getConfig().cores;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function (worker, code, signal) {
        Log.logWarn('Worker ' + worker.process.pid + ' died.');
        cluster.fork();
      });

      cluster.on('listening', function (worker, address) {
        Log.logInfo('Worker started with PID ' + worker.process.pid + '.');
      });
    } else {
      func();
    }
  }
}