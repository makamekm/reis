import * as fs from 'fs';
import * as path from 'path';
import * as StackTraceParser from 'stacktrace-parser';

import { getConfig } from '../Modules/Config';
import { isString } from 'util';
const net = require('net');
const sender = require('os').hostname();

let logFile = getConfig().logFile && path.resolve(getConfig().logFile);
let logConsole = getConfig().logConsole;
let logLogstash = getConfig().logLogstash;

type LogstashI = { log: Function, connection: any };

class Logstash {
  messageQueue: string[] = [];
  logstashConnection: LogstashI;
  logstashStatus: boolean = false;
  logstashTries: number = 0;

  private logstashMessage(tags, level, {message, ...data}: any) {
    return JSON.stringify({
      "@tags": tags,
      "@message": message,
      "@fields": {
        "sender": sender
      },
      "level": level,
      ...data
    });
  }

  private async logstashBack(host, port, onClose): Promise<LogstashI> {
    return await new Promise<LogstashI>((r, e) => {
      const connection = net.createConnection({host, port}, function() {
        r({
          log: async (message) => {
            await new Promise(mr => {
              mr(connection.write(message));
            })
          },
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
        this.messageQueue = this.messageQueue.splice(0, 1);
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
        result = await this.logstashConnection.log(message);
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
        this.messageQueue = this.messageQueue.splice(0, 1);
      } else {
        this.logstashTries++;
        console.log('Cant send a logstash message', logLogstash, message);
      }

      this.logstashStatus = false;
    }

    return this.messageQueue.length > 0;
  }

  async log(tags: string[], level: string, line: LogType) {
    let message = this.logstashMessage(tags, level, line);
    this.messageQueue.push(message);
    if (this.messageQueue.length > 1000) {
      this.logstashTries = 0;
      this.messageQueue = this.messageQueue.slice(this.messageQueue.length - 1000, this.messageQueue.length);
    }
    await this.logstashSend();
  }
}

export type LogType = { [name: string]: string | LogType };

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
    let tags = process.env.TAGS ? process.env.TAGS.split(',') : [];
    tags = logLogstash.tags ? logLogstash.tags.concat(tags) : tags;
    tags = this.distinct(tags);
    this.logger.log(tags, level, line);
  }
}

class LoggerManager {
  static loggers: { [type: string]: LoggerI } = {}

  public static log(level: string, line: LogType) {
    if (logConsole) {
      console.log(level, line);
    }

    if (logLogstash) {
      if (!this.loggers.logstash) {
        this.loggers.logstash = new LogstashLogger();
      }
      this.loggers.logstash.log(level, line);
    }
  }
}

export const logError = (error: Error, error_type: string, additional: LogType = {}) => {
  let stack = StackTraceParser.parse(error.stack);
  let line = {
    ...additional,
    version: process.env.VERSION,
    message: error.message,
    stack,
    error_type
  };

  LoggerManager.log('error', line);
}

export const log = (level: string, line: string | LogType) => {
  LoggerManager.log(level, isString(line) ? { message: line } : line);
}

export const logInfo = (line: string | LogType) => {
  LoggerManager.log('info', isString(line) ? { message: line } : line);
}

export const logVerbose = (line: string | LogType) => {
  LoggerManager.log('verbose', isString(line) ? { message: line } : line);
}

export const logClientError = (message: string, stack: string, data: LogType = {}) => {
  let line = {
    ...data,
    message,
    stack
  };

  LoggerManager.log('client', line);
}
