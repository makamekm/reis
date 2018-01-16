import * as fs from 'fs';
import * as path from 'path';
import * as lockFile from 'lockfile';
import * as prependFile from 'prepend-file';
import * as StackTraceParser from 'stacktrace-parser';

let logDir = './';

export function setLogDir(p) {
  logDir = p;
}

export async function waitFile(p) {
  await new Promise((r, e) => {
    let tryes = 0;

    let f = () => {
      if (lockFile.checkSync(p)) {
        if (tryes < 10) {
          setTimeout(f, 50);
          tryes++;
        } else {
          e(new Error('File lock timeout'));
        }
      } else {
        r();
      }
    };

    f();
  });
}

export const fixError = async (error: Error, type: string, additional?: any) => {
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

  // await waitFile(path.resolve(logDir, 'log.lock'));
  // lockFile.lockSync(path.resolve(logDir, 'log.lock'));

  await new Promise(r => prependFile(path.resolve(logDir, 'log.txt'), parsedMessage, (err) => {
    if (err) console.error(err);
    r();
  }));

  // lockFile.unlockSync(path.resolve(logDir, 'log.lock'));
  // if(fs.existsSync(path.resolve(logDir, 'log.lock'))) fs.unlinkSync(path.resolve(logDir, 'log.lock'));
}

export const logConsole = async (message: string) => {
  let parsedMessage = '\r\n' + message;

  // await waitFile(path.resolve(logDir, 'logConsole.lock'));
  // lockFile.lockSync(path.resolve(logDir, 'logConsole.lock'));

  await new Promise(r => prependFile(path.resolve(logDir, 'logConsole.txt'), parsedMessage, (err) => {
    if (err) console.error(err);
    r();
  }));

  // lockFile.unlockSync(path.resolve(logDir, 'logConsole.lock'));
  // if(fs.existsSync(path.resolve(logDir, 'logConsole.lock'))) fs.unlinkSync(path.resolve(logDir, 'logConsole.lock'));
}

export const fixClientError = async (message: string, stack: string) => {
  let line = {
    date: new Date(),
    version: process.env.VERSION,
    message: message,
    stack: JSON.parse(stack),
    type: 'client'
  };
  let parsedMessage = '\r\n' + JSON.stringify(line);

  // await waitFile(path.resolve(logDir, 'log.lock'));
  // lockFile.lockSync(path.resolve(logDir, 'log.lock'));

  await new Promise(r => prependFile(path.resolve(logDir, 'log.txt'), parsedMessage, (err) => {
    if (err) console.error(err);
    r();
  }));

  // lockFile.unlockSync(path.resolve(logDir, 'log.lock'));
  // if(fs.existsSync(path.resolve(logDir, 'log.lock'))) fs.unlinkSync(path.resolve(logDir, 'log.lock'));
}