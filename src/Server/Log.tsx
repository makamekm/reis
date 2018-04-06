import * as fs from 'fs';
import * as path from 'path';
import * as prependFile from 'prepend-file';
import * as StackTraceParser from 'stacktrace-parser';
import _winston = require('winston');
export const winston = _winston;
require('winston-logstash');

import { getConfig } from '../Modules/Config';

let logInfoPath = getConfig().logInfoPath && path.resolve(getConfig().logInfoPath);
let logErrorPath = getConfig().logErrorPath && path.resolve(getConfig().logErrorPath);
let logVerbosePath = getConfig().logVerbosePath && path.resolve(getConfig().logVerbosePath);
let logClientErrorPath = getConfig().logClientErrorPath && path.resolve(getConfig().logClientErrorPath);
let logInfoToConsole = getConfig().logInfoToConsole;
let logVerboseToConsole = getConfig().logVerboseToConsole;
let logErrorToConsole = getConfig().logErrorToConsole;
let logClientToConsole = getConfig().logClientToConsole;
let logLogstash = getConfig().logLogstash;

winston.configure({
  transports: []
});

if (logInfoPath) winston.add(winston.transports.File, { filename: logInfoPath, level: 'info' });
if (logErrorPath) winston.add(winston.transports.File, { filename: logErrorPath, level: 'error' });
if (logVerbosePath) winston.add(winston.transports.File, { filename: logVerbosePath, level: 'verbose' });
if (logClientErrorPath) winston.add(winston.transports.File, { filename: logClientErrorPath, level: 'error' });

if (logInfoToConsole) winston.add(winston.transports.Console, { level: 'info' });
if (logErrorToConsole) winston.add(winston.transports.Console, { level: 'error' });
if (logVerboseToConsole) winston.add(winston.transports.Console, { level: 'verbose' });
if (logClientToConsole) winston.add(winston.transports.Console, { level: 'error' });

if (logLogstash) winston.add(winston.transports.Logstash, {
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

  winston.log('error', line);
}

export const log = (type: string, line: string | LogType) => {
  winston.log(type, line);
}

export const logInfo = (line: string | LogType) => {
  winston.log('info', line);
}

export const logVerbose = (line: string | LogType) => {
  winston.log('verbose', line);
}

export const logClientError = (message: string, stack: string, data: LogType = {}) => {
  let line = {
    ...data,
    message: message,
    stack,
    error_type: 'client'
  };

  winston.log('info', line);
}
