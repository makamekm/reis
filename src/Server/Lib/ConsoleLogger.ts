import { getConfig } from '../../Modules/Config';
import { LoggerI, LogType } from "./Logger";

const logConsoleConfig = getConfig().logConsole;

export class ConsoleLogger implements LoggerI {
    log(level: string, line: LogType) {
        console.log(level, line);
    }

    getLevel() {
        return logConsoleConfig && logConsoleConfig.level;
    }
}