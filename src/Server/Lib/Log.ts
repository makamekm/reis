import { LogLevel } from "./Logger";

export function getLevelNumber(level?: LogLevel) {
    if (level == 'debug') return 3;
    if (level == 'info') return 2;
    if (level == 'warn') return 1;
    if (level == 'error') return 0;
    return -1;
}

export function isWritableLevel(levelFrom: LogLevel, levelTo: LogLevel) {
    return getLevelNumber(levelFrom) <= getLevelNumber(levelTo);
}