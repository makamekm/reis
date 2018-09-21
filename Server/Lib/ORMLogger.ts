import * as TypeORM from 'typeorm';

import * as Log from '../../Modules/Log';

export class ORMLogger implements TypeORM.Logger {

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

    log(level, message: any, queryRunner?: TypeORM.QueryRunner) {
        Log.log(level, { message, type: "typeorm" });
    }
}