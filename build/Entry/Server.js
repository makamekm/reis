"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const cluster = require("cluster");
const os = require("os");
function trim(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
let dirPath = process.argv.find(s => s.indexOf('dir=') == 0);
if (dirPath)
    dirPath = trim(dirPath.substring(4), '"');
const Config_1 = require("../Modules/Config");
Config_1.readConfig();
const Config_2 = require("../Modules/Config");
const Validator_1 = require("../Modules/Validator");
let validate = Validator_1.configValidator(Config_1.getConfig(), {
    languages: Config_2.awalableLanguages
});
if (validate.length) {
    throw new Error('Config is not valid: ' + validate.map(e => typeof (e) === 'string' ? e : e.message).join('; ') + ';');
}
const Translation = require("../Modules/Translation");
Translation.setState(Config_1.getConfig().defaultLanguage, Config_1.getConfig().languages, Config_2.translation);
const Server = require("../Server/Server");
const ORM = require("../Modules/ORM");
function start() {
    if (process.env.NODE_ENV == 'development') {
        const app = new Server.Server(dirPath);
        app.start();
    }
    else {
        if (cluster.isMaster) {
            let numCPUs = os.cpus().length;
            // Fork workers.
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            // If a worker dies, log it to the console and start another worker.
            cluster.on('exit', function (worker, code, signal) {
                console.log('Worker ' + worker.process.pid + ' died.');
                cluster.fork();
            });
            // Log when a worker starts listening
            cluster.on('listening', function (worker, address) {
                console.log('Worker started with PID ' + worker.process.pid + '.');
            });
        }
        else {
            const app = new Server.Server(dirPath);
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
                let bind = typeof Config_1.getConfig().port === 'string' ? 'Pipe ' + Config_1.getConfig().port : 'Port ' + Config_1.getConfig().port;
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
exports.run = () => {
    if (!Config_1.existConfig()) {
        Config_1.SaveConfig(Config_1.getConfig());
        if (Config_1.getConfig().db.Main.type == 'sqlite' && !fs.existsSync(path.resolve('./', Config_1.getConfig().db.Main.database))) {
            ORM.Manager.Sync('force').then(() => {
                start();
            }).catch(e => {
                console.error(e);
            });
        }
        else {
            start();
        }
    }
    else {
        start();
    }
};
//# sourceMappingURL=Server.js.map