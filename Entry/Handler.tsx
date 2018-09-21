require("fetch-everywhere");
import "reflect-metadata";

import { HandlerManager } from '../Modules/Handler';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = (callback?: (manager: HandlerManager) => void) => runCluster(() => {
  const cronManager = new HandlerManager(process.env.HANDLER_SCOPE);
  cronManager.init(callback);
});