require("source-map-support").install();
require("fetch-everywhere");

process.env.MODE = 'server';

let scope: any = process.env.HANDLER_SCOPE || 'Main';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Modules/Log';
Log.init();

import * as ORM from '../Modules/ORM';
import * as Handler from '../Modules/Handler';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = () => runCluster(() => {
  const cronManager = new Handler.JobManager(scope);
  cronManager.init();
});