"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("typeorm"), exports);
const Config_1 = require("./Config");
const ORM = require("../Server/ORM");
var ORM_1 = require("../Server/ORM");
exports.RegisterEntity = ORM_1.RegisterEntity;
const Log = require("./Log");
class Logger {
    logMigration(message, queryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM migration: " + message);
    }
    logQuery(query, parameters, queryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM Query: " + query + ' With parameters: ' + JSON.stringify(parameters));
    }
    logQueryError(error, query, parameters, queryRunner) {
        Log.fixError(new Error('Error: ' + error + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'orm');
    }
    logQuerySlow(time, query, parameters, queryRunner) {
        Log.fixError(new Error('Slow: ' + time + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'ormSlow');
    }
    logSchemaBuild(message, queryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] Schema: " + message);
    }
    log(level, message, queryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM Level: " + level + " Message: " + message);
    }
}
exports.initialize = () => {
    const config = JSON.parse(JSON.stringify(Config_1.getConfig().db));
    config.Main.autoSchemaSync = false;
    config.Main.entities = ORM.Manager.getEntity();
    if (process.env.NODE_ENV == 'development') {
        config.Main.logging = "all";
        // (config.Main as any).logger = "file";
        config.Main.logger = new Logger();
    }
    else {
        // IF PROD catch in a spec class and log errors
        config.Main.logging = ["error"];
        config.Main.logger = new Logger();
    }
    exports.Manager = new ORM.Manager(config);
};
//# sourceMappingURL=ORM.js.map