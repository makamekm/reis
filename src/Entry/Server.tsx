require("source-map-support").install();
require("fetch-everywhere");
import "reflect-metadata";
import * as express from 'express';

process.env.MODE = 'server';

import { getConfig, readConfig } from '../Modules/Config';
readConfig();

import * as Log from '../Modules/Log';
Log.init();

import * as Server from '../Server/Server';
import { runCluster } from '../Server/Lib/EntryRunner';

export const run = (callback?: (app: express.Express) => void) => runCluster(() => {
  const app = new Server.Server();
  app.start(callback);
});