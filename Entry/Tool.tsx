require("fetch-everywhere");
import "reflect-metadata";

import * as Log from '../Modules/Log';
import * as ORM from '../Modules/ORM';
import * as Tool from '../Modules/Tool';
import { Commander } from '../Server/Commander';

export const run = async (callback?: (commander: Commander) => void) => {
  const commander = new Commander({
    db_sync: {
      description: "Sync DB",
      action: async args => {
        console.log("DB syncing...");
        await ORM.sync();
        console.log("DB has been successfully synced!");
      }
    },
    db_drop: {
      description: "Drop DB",
      action: async args => {
        console.log("DB dropping");
        await ORM.drop();
        console.log("DB has been successfully dropped!");
      }
    },
    db_test: {
      description: "Test DB",
      action: async args => {
        console.log("DB testing...");
        await ORM.test();
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
    await commander.run(args[0], args.slice(1));
    if (callback) callback(commander);
  } else {
    console.log("Type 'help' argument to get some help");
    if (callback) callback(commander);
  }
}