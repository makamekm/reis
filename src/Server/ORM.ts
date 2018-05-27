import { getConfig } from '../Modules/Config';
import { ORMManager } from './ORMManager';
import { initializeScope } from './Lib/ORM';

const Managers: { [name: string]: ORMManager } = {};

export function Manager(scope: string = 'Main'): ORMManager {
    if (!Managers[scope]) {
        Managers[scope] = initializeScope(scope);
    }
    return Managers[scope];
};

export async function Test() {
    for (let name in getConfig().db) {
        await Manager(name).Test();
    }
}

export async function Drop() {
    for (let name in getConfig().db) {
        await Manager(name).Drop();
    }
}

export async function Sync() {
    for (let name in getConfig().db) {
        await Manager(name).Sync();
    }
}