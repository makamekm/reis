import * as fs from 'fs';
import * as path from 'path';
import * as prependFile from 'prepend-file';
import * as StackTraceParser from 'stacktrace-parser';
import _winston = require('winston');
export const winston = _winston;

import { getConfig } from '../Modules/Config';

let logInfoPath = getConfig().logInfoPath && path.resolve(getConfig().logInfoPath);
let logErrorPath = getConfig().logErrorPath && path.resolve(getConfig().logErrorPath);
let logVerbosePath = getConfig().logVerbosePath && path.resolve(getConfig().logVerbosePath);
let logClientErrorPath = getConfig().logClientErrorPath && path.resolve(getConfig().logClientErrorPath);
let logInfoToConsole = getConfig().logInfoToConsole;
let logVerboseToConsole = getConfig().logVerboseToConsole;
let logErrorToConsole = getConfig().logErrorToConsole;
let logClientToConsole = getConfig().logClientToConsole;

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

export const logError = (error: Error, type: string, additional?: any) => {
  let stack = StackTraceParser.parse(error.stack);
  let line = {
    date: new Date(),
    version: process.env.VERSION,
    message: error.message,
    stack,
    type,
    additional
  };

  let parsedMessage = '\r\n' + JSON.stringify(line);
  winston.log('error', parsedMessage);
}

export const logInfo = (message: string) => {
  if (logInfoToConsole) console.error(message);

  let parsedMessage = '\r\n' + message;
  winston.log('info', parsedMessage);
}

export const logVerbose = (message: string) => {
  if (logVerboseToConsole) console.error(message);

  let parsedMessage = '\r\n' + message;
  winston.log('verbose', parsedMessage);
}

export const logClientError = (message: string, stack: string) => {
  let line = {
    date: new Date(),
    version: process.env.VERSION,
    message: message,
    stack: JSON.parse(stack),
    type: 'client'
  };

  let parsedMessage = '\r\n' + JSON.stringify(line);
  winston.log('info', parsedMessage);
}