"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const os = require("os");
function trim(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
const Config_1 = require("../Modules/Config");
Config_1.readConfig();
let cores = process.argv.find(s => s.indexOf('cores=') == 0);
if (cores)
    cores = Number(trim(cores.substring(6), '"'));
let scope = process.argv.find(s => s.indexOf('scope=') == 0);
if (scope)
    scope = trim(scope.substring(6), '"');
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
const Handler = require("../Modules/Handler");
exports.run = () => {
    if (cores == 1) {
        const cronManager = new Handler.JobManager(scope || 'Main');
        cronManager.init();
    }
    else {
        if (cluster.isMaster) {
            let numCPUs = cores || os.cpus().length;
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
            const cronManager = new Handler.JobManager();
            cronManager.init();
        }
    }
};
//# sourceMappingURL=Handler.js.map