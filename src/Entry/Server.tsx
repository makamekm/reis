import * as fs from 'fs';
import * as path from 'path';
import * as cluster from 'cluster';
import * as os from 'os';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

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

import * as Server from '../Server/Server';
import * as ORM from '../Modules/ORM';

export function run() {
  if (!isMulticore) {
    const app = new Server.Server();
    app.start();
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
      const app = new Server.Server();

      app.config();
      app.setGraphQL();
      app.setRender();
      app.run();

      app.server.on('error', onError);
      app.server.on('listening', onListening);

      function onError(error) {
        if (error.syscall !== 'listen') {
          throw error;
        }

        let bind = typeof getConfig().port === 'string' ? 'Pipe ' + getConfig().port : 'Port ' + getConfig().port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
          default:
            throw error;
        }
      }

      function onListening() {
        let addr = app.server.address();
        let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('Listening on ' + bind);
      }
    }
  }
}