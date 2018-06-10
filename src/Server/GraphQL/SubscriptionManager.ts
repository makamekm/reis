import * as Subscriptions from 'graphql-subscriptions';
import * as RedisNRP from 'node-redis-pubsub';

import { getConfig } from '../../Modules/Config';

const publishes: { [name: string]: string[] } = {}
export function getPublishes() {
    return publishes;
}

let nrp: RedisNRP;
const pubsub: Subscriptions.PubSub = new Subscriptions.PubSub();
// export function getPubSub() {
//     return pubsub;
// }

export class SubscriptionManager {
    private publishes: string[]
    private name: string

    constructor(name: string = 'Main') {
        this.name = name;
        this.publishes = publishes[name];
    }

    public init() {
        if (nrp) nrp = new RedisNRP(getConfig().redisPubSub[this.name]);
        if (this.publishes) {
            for (let name of this.publishes) {
                nrp.on(name, function (data) {
                    pubsub.publish(name, data);
                });
            }
        }
    }
}

export async function Publish(name: string, data: any, scope: string = 'Main') {
    if (nrp) {
        nrp = new RedisNRP(getConfig().redisPubSub[scope]);
    }
    nrp.emit(name, data);
}

export function Subscribe(name: string, basic?: Function, filter?: (payload, variables) => boolean) {
    if (filter) {
        return Subscriptions.withFilter(() => {
            if (basic) {
                basic();
            }
            return pubsub.asyncIterator(name);
        }, filter);
    } else {
        return basic ? Subscriptions.withFilter(() => {
            basic();
            return pubsub.asyncIterator(name);
        }, () => true) : pubsub.asyncIterator(name);
    }
}