import * as redis "redis";
const { promisify } = require('util');

import { getConfig } from '../Modules/Config';

export class RedisClient {
  getAsync: (key: string) => Promise()
  setAsync: (key: string, value: any) => Promise()

  constructor(client) {
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
  }
}

scopes: { [name: string]: RedisClient } = {}

export async function getClient(scope: string = 'Main', init?: boolean): RedisClient {
  if (init || !this.scopes[scope]) {
    let client = redis.createClient({
      port: getConfig().redis[scope].port,
      host: getConfig().redis[scope].host,
      password: getConfig().redis[scope].password
    });
    this.scopes[scope] = new RedisClient(client);
  }

  return this.scopes[scope];
}
