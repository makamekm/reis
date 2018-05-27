import { getConfig } from '../Modules/Config';
import { Logstash } from "./lib/Logstash";
import { isWritableLevel } from "./Lib/Log";
import { LoggerI, LogType, LogLevel } from "./Lib/Logger";
import { LogstashLogger } from "./Lib/LogstashLogger";
import { ConsoleLogger } from "./Lib/ConsoleLogger";

export class LoggerManager {
    static loggers: LoggerI[] = []

    public static addLogger(logger: LoggerI) {
        this.loggers.push(logger);
    }

    public static log(level: LogLevel, line: LogType) {
        if (getConfig().logAdditional) line = {
            ...getConfig().logAdditional,
            ...line
        };

        for (const logger of this.loggers) {
            isWritableLevel(level, logger.getLevel()) && logger.log(level, line);
        }
    }
}

export function init() {
    LoggerManager.addLogger(new ConsoleLogger());
    LoggerManager.addLogger(new LogstashLogger());
}