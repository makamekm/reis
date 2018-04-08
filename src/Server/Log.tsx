import * as fs from 'fs';
import * as path from 'path';
import * as prependFile from 'prepend-file';
import * as StackTraceParser from 'stacktrace-parser';
export const winston = require('winston');
export const logger = new winston.Logger({
  transports: []
});
require('winston-logstash');

import { getConfig } from '../Modules/Config';

let logFile = getConfig().logFile && path.resolve(getConfig().logFile);
let logConsole = getConfig().logInfoToConsole;
let logLogstash = getConfig().logLogstash;

if (logFile) logger.add(winston.transports.File, { filename: logFile });
if (logConsole) logger.add(winston.transports.Console, { });
if (logLogstash) logger.add(winston.transports.Logstash, {
  ...logLogstash,
  node_name: process.env.NODE_NAME || logLogstash.node_name
});

export type LogType = { [name: string]: string };

export const logError = (error: Error, error_type: string, additional: LogType = {}) => {
  let stack = StackTraceParser.parse(error.stack);
  let line = {
    ...additional,
    version: process.env.VERSION,
    message: error.message,
    stack,
    error_type
  };

  logger.log('error', line);
}

export const log = (type: string, line: string | LogType) => {
  logger.log(type, line);
}

export const logInfo = (line: string | LogType) => {
  logger.log('info', line);
}

export const logVerbose = (line: string | LogType) => {
  logger.log('verbose', line);
}

export const logClientError = (message: string, stack: string, data: LogType = {}) => {
  let line = {
    ...data,
    message,
    stack
  };

  logger.log('client', line);
}
