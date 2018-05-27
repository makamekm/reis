require("source-map-support").install();
require("fetch-everywhere");

process.env.MODE = 'server';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Modules/Log';
Log.init();

import * as ORM from '../Modules/ORM';
import * as Tool from '../Modules/Tool';
import { Commander } from '../Server/Commander';

export const run = () => {
  const commander = new Commander({
    db_sync: {
      description: "Sync DB",
      action: async args => {
        console.log("DB syncing...");
        await ORM.Sync();
        console.log("DB has been successfully synced!");
      }
    },
    db_drop: {
      description: "Drop DB",
      action: async args => {
        console.log("DB dropping");
        await ORM.Drop();
        console.log("DB has been successfully dropped!");
      }
    },
    db_test: {
      description: "Test DB",
      action: async args => {
        console.log("DB testing...");
        await ORM.Test();
        console.log("DB has been successfully tested!");
      }
    },
    log_test: {
      description: "Test logging",
      action: async args => {
        Log.logInfo({text: "test"})
      }
    },
    log_error_test: {
      description: "Test error logging",
      action: async args => {
        Log.logError(new Error("test"), { type: "tool" });
      }
    },
    ...Tool.commands
  });
  let args = process.argv.slice(2);
  if (args[0]) {
    commander.run(args[0], args.slice(1));
  } else {
    console.log("Type 'help' argument to get some help");
  }
}