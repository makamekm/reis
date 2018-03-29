import redis = require("redis");
import { promisify } from 'util';

import { getConfig } from '../Modules/Config';

export class RedisClient {

    getAsync: <T = any>(key: string) => Promise<T>
    setAsync: <T = any>(key: string, value: T) => Promise<void>

    constructor(client) {
        this.getAsync = promisify(client.get).bind(client);
        this.setAsync = promisify(client.set).bind(client);
    }
}

export const scopes: { [name: string]: RedisClient } = {};

export function getClient(scope: string = 'Main', init?: boolean): RedisClient {
    if (init || !scopes[scope]) {
        let client = redis.createClient({
            port: getConfig().redis[scope].port,
            host: getConfig().redis[scope].host,
            password: getConfig().redis[scope].password
        });
        scopes[scope] = new RedisClient(client);
    }

    return scopes[scope];
}
