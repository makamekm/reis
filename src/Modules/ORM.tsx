export * from "typeorm";
import * as TypeORM from 'typeorm';

import { getConfig } from './Config';
import * as ORM from '../Server/ORM';
export { RegisterEntity } from '../Server/ORM';

import * as Log from './Log';

class Logger implements TypeORM.Logger {

    logMigration(message: string, queryRunner?: TypeORM.QueryRunner) {
        Log.logInfo({ message, type: "typeorm", orm: 'migration' });
    }

    logQuery(query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.logVerbose({ type: "typeorm", parameters, orm: 'log', query });
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.logError(new Error(error), { type: "typeorm", parameters, orm: 'error', query });
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: TypeORM.QueryRunner) {
        Log.logWarn({ query, type: "typeorm", orm: 'slow', time, parameters });
    }

    logSchemaBuild(message: string, queryRunner?: TypeORM.QueryRunner) {
        Log.logInfo({ message, type: "typeorm", orm: 'schema_build' });
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: TypeORM.QueryRunner) {
        Log.log(level, { message, type: "typeorm" });
    }
}

const Managers: { [name: string]: ORM.Manager } = {};

function initialize(scope: string = 'Main') {
    const config = JSON.parse(JSON.stringify(getConfig().db[scope]));
    config.autoSchemaSync = false;
    config.entities = ORM.Manager.getEntity();
    config.logging = "all";
    config.logger = new Logger();
    return new ORM.Manager(config);
}

export function Manager(scope: string = 'Main'): ORM.Manager {
    if (!Managers[scope]) {
        Managers[scope] = initialize(scope);
    }
    return Managers[scope];
};

export async function Test() {
    for (let name in getConfig().db) {
        await Manager(name).Test();
    }
}

export async function Drop() {
    for (let name in getConfig().db) {
        await Manager(name).Drop();
    }
}

export async function Sync() {
    for (let name in getConfig().db) {
        await Manager(name).Sync();
    }
}