import * as express from 'express';
import * as StackTraceParser from 'stacktrace-parser';
import { isString } from 'util';

import { getConfig } from '../Modules/Config';
import { isWritableLevel } from './Lib/Log';
import { LogLevel, LogType } from './Lib/Logger';
import { LoggerManager, getApm } from './LoggerManager';

// TODO: Create file logging
// import * as fs from 'fs';
// import * as path from 'path';
// const logFile = getConfig().logFile && path.resolve(getConfig().logFile);

export type ErrorState = {
    [name: string]: string[]
}

export type LogError = Error & {
  code?: number | string
  status?: number | string
  title?: string
  state?: ErrorState
  level?: LogLevel
  errorType?: string
  type?: string
}

export type ApmAdditional = {
  request?: express.Request
  response?: express.Response
}

export type LogErrorApmAdditional = ApmAdditional & LogType;

process.on('uncaughtException', function(err) {
  logError(err);
})

export const logError = (error: LogError, data: LogErrorApmAdditional = {}) => {
  let stack = StackTraceParser.parse(error.stack);

  let response = data.response;
  delete data.response;
  let request = data.request;
  delete data.request;
  let message = data.message;
  delete data.message;

  let line = {
    ...data,
    message: error.message,
    code: error.code,
    status: error.status,
    title: error.title,
    state: error.state,
    stack
  };

  for (let i in line) {
    if (line[i] === undefined) delete line[i];
  }

  if (getConfig().apm && isWritableLevel(error.level || 'error', getConfig().apm.level || 'error')) {
    getApm().captureError(error, {
      response, request, message,
      custom: line
    });
  }

  LoggerManager.log(error.level || 'error', line);
}

export const log = (level: LogLevel, line: string | LogType) => {
  LoggerManager.log(level, isString(line) ? { message: line } : line);
}

export const logDebug = (line: string | LogType) => {
  LoggerManager.log('debug', isString(line) ? { message: line } : line);
}

export const logWarn = (line: string | LogType) => {
  LoggerManager.log('warn', isString(line) ? { message: line } : line);
}

export const logInfo = (line: string | LogType) => {
  LoggerManager.log('info', isString(line) ? { message: line } : line);
}

export const logVerbose = (line: string | LogType) => {
  LoggerManager.log('debug', isString(line) ? { message: line } : line);
}

export const logClientError = (message: string, stack: string, data: LogType = {}) => {
  let line = {
    ...data,
    message,
    stack,
    client: true
  };

  LoggerManager.log('error', line);
}
