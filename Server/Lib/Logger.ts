import * as express from 'express';

export type LogLevel = 'error' | 'debug' | 'info' | 'warn';
export type LogType = { [name: string]: (string | string[] | boolean | number | LogType | express.Request | express.Response) };

export interface LoggerI {
    log(level, line: LogType): void
    getLevel(): LogLevel
}