import redis = require("redis");
import { promisify } from 'util';

import { getConfig } from '../Modules/Config';

export class RedisClient {
    get: <T = any>(key: string) => Promise<T>
    set: <T = any>(key: string, value: T) => Promise<void>

    constructor(client) {
        this.get = promisify(client.get).bind(client);
        this.set = promisify(client.set).bind(client);
    }
}

export const scopes: { [name: string]: RedisClient } = {};

export function getClient(scope: string = 'default', init?: boolean): RedisClient {
    if (init || !scopes[scope]) {
        let client = redis.createClient(getConfig().redis[scope]);
        scopes[scope] = new RedisClient(client);
    }

    return scopes[scope];
}
