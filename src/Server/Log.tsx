import * as fs from 'fs';
import * as path from 'path';
import * as StackTraceParser from 'stacktrace-parser';

import { getConfig } from '../Modules/Config';
import { isString } from 'util';
const net = require('net');
const sender = require('os').hostname();

const logFile = getConfig().logFile && path.resolve(getConfig().logFile);
const logConsole = getConfig().logConsole;
const logLogstash = getConfig().logLogstash;
const apmConfig = getConfig().apm;

import apm = require('elastic-apm-node');
apmConfig && apm.start(apmConfig);

export function getApm() {
  return apm;
}

function getLevelNumber(level: string) {
  if (level == 'debug') return 3;
  if (level == 'info') return 2;
  if (level == 'warn') return 1;
  if (level == 'error') return 0;

  return 0;
}

function isWritableLevel(levelFrom: string, levelTo: string) {
  return getLevelNumber(levelFrom) <= getLevelNumber(levelTo);
}

type LogstashI = { log: Function, connection: any };

class Logstash {
  messageQueue: string[] = [];
  logstashConnection: LogstashI;
  logstashStatus: boolean = false;
  logstashTries: number = 0;

  private logstashMessage(tags, fields, metadata, level, message) {
    return JSON.stringify({
      ...message,
      "@tags": tags,
      "@fields": fields,
      "@metadata": metadata,
      "level": level
    }) + "\n";
  }

  private async logstashBack(host, port, onClose): Promise<LogstashI> {
    return await new Promise<LogstashI>((r, e) => {
      const connection = net.createConnection({host, port}, function() {
        r({
          log: (message) => connection.write(message),
          connection
        })
      })
      .on('error', function(err) {
        e(err);
      })
      .on('end', function() {
        onClose();
      });
    })
  }

  public async logstashSend() {
    if (this.messageQueue.length > 0 && !this.logstashStatus) {
      if (this.logstashTries > (logLogstash.tries || 3)) {
        this.logstashTries = 0;
        this.messageQueue = this.messageQueue.slice(1);
      }
    }

    if (this.messageQueue.length > 0 && !this.logstashStatus) {
      this.logstashStatus = true;

      let message = this.messageQueue[0];

      if (!this.logstashConnection) {
        try {
          this.logstashConnection = await this.logstashBack(logLogstash.host, logLogstash.port, () => {
            this.logstashConnection = null;
          });
        } catch (e) {
          this.logstashConnection = null;
          this.logstashTries++;
          this.logstashStatus = false;
          console.log('Fail connecting with logstash', logLogstash, message, e);
          return true;
        }
      }

      let result: boolean;

      try {
        result = this.logstashConnection.log(message);
      } catch (e) {
        try {
          await new Promise(r => this.logstashConnection.connection.close(r));
        } catch (e) {}
        this.logstashConnection = null;
        this.logstashTries++;
        this.logstashStatus = false;
        console.log('Fail sending a logstash message', logLogstash, message, e);
        return true;
      }

      if (result) {
        this.logstashTries = 0;
        this.messageQueue = this.messageQueue.slice(1);
      } else {
        this.logstashTries++;
        console.log('Cant send a logstash message', logLogstash, message);
      }

      this.logstashStatus = false;
    }

    return this.messageQueue.length > 0;
  }

  async log(tags: string[], fields: string[], metadata: string[], level: string, line: LogType) {
    let message = this.logstashMessage(tags, fields, metadata, level, line);
    this.messageQueue.push(message);
    if (this.messageQueue.length > 1000) {
      this.logstashTries = 0;
      this.messageQueue = this.messageQueue.slice(this.messageQueue.length - 1000);
    }
    await this.logstashSend();
  }
}

export type LogType = { [name: string]: (string | string[] | boolean | number | LogType) };

interface LoggerI {
  log(level, line: LogType): void
}

class LogstashLogger implements LoggerI {
  logger: Logstash = new Logstash();
  timer: any

  constructor() {
    this.logger = new Logstash();
    this.startTimer();
  }

  private distinct(tags: string[]) {
    return tags.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }

  private startTimer() {
    this.timer = setInterval(() => this.logger.logstashSend(), logLogstash.interval || 300);
  }

  public log(level: string, line: LogType) {
    const fields = {
      'sender': logLogstash.sender || sender,
      ...(typeof line['@fields'] == 'object' ? (line['@fields'] as any) : {})
    };
    const metadata = {
      'beat': logLogstash.beat || 'reiso',
      'type': logLogstash.type || 'reiso',
      ...(typeof line['@metadata'] == 'object' ? (line['@metadata'] as any) : {})
    };
    let tags = [];
    if (logLogstash.tags && Array.isArray(logLogstash.tags)) {
      tags = logLogstash.tags.concat(tags);
    } else if (logLogstash.tags) {
      tags = logLogstash.tags.split(',');
    }
    tags = logLogstash.tags ? logLogstash.tags.concat(tags) : tags;
    tags = (line.tags && Array.isArray(line.tags)) ? line.tags.concat(tags) : tags;
    tags = this.distinct(tags);

    this.logger.log(tags, fields, metadata, level, line);
  }
}

class LoggerManager {
  static loggers: { [type: string]: LoggerI } = {}

  public static log(level: string, line: LogType) {
    if (getConfig().logAdditional) line = {
      ...getConfig().logAdditional,
      ...line
    };

    if (logConsole && isWritableLevel(level, logConsole.level || 'error')) {
      console.log(level, line);
    }

    if (logLogstash && isWritableLevel(level, logLogstash.level || 'error')) {
      if (!this.loggers.logstash) {
        this.loggers.logstash = new LogstashLogger();
      }
      this.loggers.logstash.log(level, line);
    }
  }
}

export const logError = (error: Error | any, data: LogType = {}) => {
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

  if (apmConfig && apm && isWritableLevel(error.level || 'error', apmConfig.level || 'error')) {
    apm.captureError(error, {
      response, request, message,
      custom: line
    });
  }

  LoggerManager.log(error.level || 'error', line);
}

export const log = (level: string, line: string | LogType) => {
  LoggerManager.log(level, isString(line) ? { message: line } : line);
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
