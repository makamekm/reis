"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trim(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
const Config_1 = require("../Modules/Config");
Config_1.readConfig();
let scope = process.argv.find(s => s.indexOf('scope=') == 0);
if (scope)
    scope = trim(scope.substring(6), '"');
let silent = !!process.argv.find(s => s.indexOf('silent') == 0);
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
const Commander_1 = require("../Server/Commander");
const Worker = require("../Modules/Worker");
exports.run = () => {
    const cronManager = new Worker.CronManager(scope || 'Main');
    cronManager.init();
    if (!silent) {
        let commands = {
            status: {
                description: Translation.transDefault('Cron.GetStatusDescription'),
                action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
                    if (cronManager.isJob(answer)) {
                        console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
                    }
                    else {
                        console.log(Translation.transDefault('Cron.JobDeesntExist'));
                    }
                    callback();
                })
            },
            stop: {
                description: Translation.transDefault('Cron.StopDescription'),
                action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
                    if (cronManager.isJob(answer)) {
                        console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
                        console.log(Translation.transDefault('Cron.Stopping'));
                        cronManager.stop(answer).then(() => {
                            console.log(Translation.transDefault('Cron.Stoped'));
                            callback();
                        }).catch(e => {
                            console.log(Translation.transDefault("StopFailed"));
                            console.error(e);
                            callback();
                        });
                    }
                    else {
                        console.log(Translation.transDefault('Cron.JobDeesntExist'));
                        callback();
                    }
                })
            },
            start: {
                description: Translation.transDefault('Cron.StartDescription'),
                action: (read, callback) => read.question(Translation.transDefault('Cron.EnterJobName'), function (answer) {
                    if (cronManager.isJob(answer)) {
                        console.log(Translation.transDefault('Cron.JobStatus', cronManager.status(answer) ? '1' : '0', cronManager.isRunning(answer) ? '1' : '0'));
                        cronManager.start(answer);
                        console.log(Translation.transDefault('Cron.Started'));
                    }
                    else {
                        console.log(Translation.transDefault('Cron.JobDeesntExist'));
                    }
                    callback();
                })
            },
            names: {
                description: Translation.transDefault('Cron.GetNamesDescription'),
                action: (read, callback) => {
                    cronManager.getNames().forEach(name => console.log(name));
                    callback();
                }
            }
        };
        const commander = new Commander_1.Commander(commands);
        commander.cycle();
    }
};
//# sourceMappingURL=Worker.js.map