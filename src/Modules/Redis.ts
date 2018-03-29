import * as redis from "redis";
import { promisify } from 'util';

import { getConfig } from '../Modules/Config';

export class RedisClient {
    
    getAsync: (key: string) => Promise<void>
    setAsync: (key: string, value: any) => Promise<void>

    constructor(client) {
        this.getAsync = promisify(client.get).bind(client);
        this.setAsync = promisify(client.set).bind(client);
    }
}

export const scopes: { [name: string]: RedisClient } = {};

export async function getClient(scope: string = 'Main', init?: boolean): Promise<RedisClient> {
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
