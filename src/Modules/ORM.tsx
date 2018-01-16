export * from "typeorm";
import * as TypeORM from 'typeorm';

import { getConfig } from './Config';
import * as ORM from '../Server/ORM';
export { RegisterEntity } from '../Server/ORM';

import * as Log from './Log';

class Logger implements TypeORM.Logger {

    logMigration(message: string, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM migration: " + message);
    }

    logQuery(query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM Query: " + query + ' With parameters: ' + JSON.stringify(parameters));
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.fixError(new Error('Error: ' + error + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'orm');
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.fixError(new Error('Slow: ' + time + ' Query: ' + query + ' With parameters: ' + JSON.stringify(parameters)), 'ormSlow');
    }

    logSchemaBuild(message: string, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] Schema: " + message);
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: TypeORM.QueryRunner) {
        const date = new Date();
        Log.logConsole("[" + date.toISOString() + "] ORM Level: " + level + " Message: " + message);
    }
}

export let Manager: ORM.Manager;

export const initialize = () => {
    const config: ORM.Config = JSON.parse(JSON.stringify(getConfig().db));
    (config.Main as any).autoSchemaSync = false;
    (config.Main as any).entities = ORM.Manager.getEntity();
    if (process.env.NODE_ENV == 'development') {
        (config.Main as any).logging = "all";
        // (config.Main as any).logger = "file";
        (config.Main as any).logger = new Logger();
    } else {
        // IF PROD catch in a spec class and log errors
        (config.Main as any).logging = ["error"];
        (config.Main as any).logger = new Logger();
    }
    Manager = new ORM.Manager(config);
}