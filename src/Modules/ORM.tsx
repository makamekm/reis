export * from "typeorm";
import * as TypeORM from 'typeorm';

import { getConfig } from './Config';
import * as ORM from '../Server/ORM';
export { RegisterEntity } from '../Server/ORM';

import * as Log from './Log';

class Logger implements TypeORM.Logger {

    logMigration(message: string, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logVerbose("[" + date.toISOString() + "] ORM migration: " + message);
    }

    logQuery(query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logVerbose("[" + date.toISOString() + "] ORM Query: " + query + ' With parameters: ' + JSON.stringify(parameters));
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.logError(new Error('Error: ' + error + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'orm');
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.logError(new Error('Slow: ' + time + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'ormSlow');
    }

    logSchemaBuild(message: string, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logVerbose("[" + date.toISOString() + "] Schema: " + message);
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logVerbose("[" + date.toISOString() + "] ORM Level: " + level + " Message: " + message);
    }
}

const Managers: { [name: string]: ORM.Manager } = {};

function initialize(scope: string = 'Main') {
    const config = JSON.parse(JSON.stringify(getConfig().db[scope]));
    config.autoSchemaSync = false;
    config.entities = ORM.Manager.getEntity();
    if (process.env.VERBOSE) {
        config.logging = "all";
        config.logger = new Logger();
    } else {
        config.logging = ["error"];
        config.logger = new Logger();
    }
    return new ORM.Manager(config);
}

export function Manager(scope: string = 'Main'): ORM.Manager {
    if (!Managers[scope]) {
        Managers[scope] = initialize(scope);
    } else {
        return Managers[scope];
    }
};