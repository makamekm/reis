require("fetch-everywhere");
import "reflect-metadata";

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