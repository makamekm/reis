import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Server/Log';

import { translation } from '../Modules/Config';

import * as Translation from '../Modules/Translation';
Translation.setState(getConfig().defaultLanguage, getConfig().languages, translation);

import * as ORM from '../Modules/ORM';
import * as Tool from '../Modules/Tool';

import { Commander } from '../Server/Commander';

export const run = () => {
  let commands = {
    db_sync: {
      description: "Sync DB",
      action: async (read, callback) => {
        console.log("DB has been successfully synced!");
        let orm = ORM.Manager();
        await orm.Sync();
        console.log("DB has been successfully synced!");
        callback();
      }
    },
    db_drop: {
      description: "Drop DB",
      action: async (read, callback) => {
        console.log("DB has been successfully dropped!");
        let orm = ORM.Manager();
        await orm.Drop();
        console.log("DB has been successfully dropped!");
        callback();
      }
    },
    db_test: {
      description: "Test DB",
      action: async (read, callback) => {
        console.log("DB has been successfully tested!");
        let orm = ORM.Manager();
        await orm.Test();
        console.log("DB has been successfully tested!");
        callback();
      }
    },
    log_test: {
      description: "Test DB",
      action: async (read, callback) => {
        Log.logInfo({message: "test"})
        callback();
      }
    },
    log_error_test: {
      description: "Test DB",
      action: async (read, callback) => {
        Log.logError(new Error("test"), "tool");
        callback();
      }
    },
    ...Tool.commands
  }
  const commander = new Commander(commands);
  commander.cycle();
}