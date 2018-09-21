import { getConfig } from '../Modules/Config';
import { ORMManager } from './ORMManager';
import { initializeScope } from './Lib/ORM';

const Managers: { [name: string]: ORMManager } = {};

export function Manager(scope: string = 'default', init: boolean = false): ORMManager {
    if (!Managers[scope] || init) {
        Managers[scope] = initializeScope(scope);
    }
    return Managers[scope];
};

export async function test() {
    for (let name in getConfig().db) {
        await Manager(name).test();
    }
}

export async function drop() {
    for (let name in getConfig().db) {
        await Manager(name).drop();
    }
}

export async function sync() {
    for (let name in getConfig().db) {
        await Manager(name).sync();
    }
}