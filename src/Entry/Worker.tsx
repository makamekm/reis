require("source-map-support").install();
require("fetch-everywhere");
import "reflect-metadata";

process.env.MODE = 'server';

import * as cluster from 'cluster';
import * as os from 'os';
import * as cron from 'cron';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

let scope: any = process.env.WORKER_SCOPE;

import * as Log from '../Modules/Log';
Log.init();

import * as Worker from '../Modules/Worker';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = (callback?: (manager: Worker.CronManager) => void) => runCluster(() => {
  const cronManager = new Worker.CronManager(scope);
  cronManager.init(callback);
});