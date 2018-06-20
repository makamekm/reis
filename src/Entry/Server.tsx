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

let app: Server.Server;

export async function run(): Promise<Server.Server> {
  return await new Promise<Server.Server>(r => runCluster(async () => {
    app = new Server.Server();
    await app.start();
    r();
  }));
}

export async function stop() {
  await app.stop();
}