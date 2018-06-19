require("source-map-support").install();
require("fetch-everywhere");
import "reflect-metadata";

process.env.MODE = 'server';

let scope: any = process.env.HANDLER_SCOPE || 'Main';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Modules/Log';
Log.init();

import { HandlerManager } from '../Modules/Handler';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = (callback?: (manager: HandlerManager) => void) => runCluster(() => {
  const cronManager = new HandlerManager(scope);
  cronManager.init(callback);
});