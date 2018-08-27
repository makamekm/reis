import * as Subscriptions from 'graphql-subscriptions';
import * as RedisNRP from 'node-redis-pubsub';

import { getConfig } from '../../Modules/Config';

let nrp: RedisNRP;
const pubsub: Subscriptions.PubSub = new Subscriptions.PubSub();

let publishes: { [name: string]: string[] } = {}
export function getPublishes() {
    return publishes;
}
export function cleanPublishes() {
    if (nrp) nrp.quit();
    nrp = null;
    publishes = {};
}

export class SubscriptionManager {
    private publishes: string[]
    private name: string

    constructor(name: string = 'Main') {
        this.name = name;
        this.publishes = publishes[name];
    }

    public init() {
        if (!nrp) nrp = new RedisNRP(getConfig().redisPubSub[this.name]);
        if (this.publishes) {
            for (let name of this.publishes) {
                nrp.on(name, (data) => {
                    pubsub.publish(name, data);
                });
            }
        }
    }
}

export async function Publish(name: string, data: any, scope: string = 'Main') {
    if (!nrp) {
        nrp = new RedisNRP(getConfig().redisPubSub[scope]);
    }
    nrp.publish(name, data);
}

export function Subscribe(name: string | string[], filter?: (data) => boolean, exceptionCheck?: Function) {
    if (filter) {
        return Subscriptions.withFilter(() => {
            if (exceptionCheck) {
                exceptionCheck();
            }
            return pubsub.asyncIterator(name);
        }, filter);
    } else {
        return exceptionCheck ? Subscriptions.withFilter(() => {
            exceptionCheck();
            return pubsub.asyncIterator(name);
        }, () => true) : () => pubsub.asyncIterator(name);
    }
}