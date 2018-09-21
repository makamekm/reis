import { getConfig } from '../../Modules/Config';
import { LoggerI, LogType, LogLevel } from "./Logger";

export class ConsoleLogger implements LoggerI {
    private config: {
        level?: LogLevel
    }

    constructor() {
        this.config = getConfig().logConsole || {};
    }

    log(level: string, line: LogType) {
        console.log(level, new Date(), line);
    }

    getLevel() {
        return this.config.level;
    }
}