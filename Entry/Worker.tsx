require("fetch-everywhere");
import "reflect-metadata";
import * as cluster from 'cluster';
import * as os from 'os';
import * as cron from 'cron';

import * as Worker from '../Modules/Worker';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = (callback?: (manager: Worker.CronManager) => void) => runCluster(() => {
  const cronManager = new Worker.CronManager(process.env.WORKER_SCOPE);
  cronManager.init(callback);
});