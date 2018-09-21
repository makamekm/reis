import { WorkerOption, Job } from './Lib/Worker';
export * from './CronManager';
import { CronEvents } from './CronManager';

let scope: { [name: string]: { [name: string]: Job } } = {}
export function getJobs(name: string) {
    return scope[name];
}
export function RegisterWorker(opt: WorkerOption, func: (previous: Date | null) => Promise<boolean>) {
    if (!scope[opt.scope || 'default']) scope[opt.scope || 'default'] = {};
    scope[opt.scope || 'default'][opt.name] = {
        cronTime: opt.cronTime,
        onTick: func
    }
}

let events: {
    type: CronEvents
    scope: string
    event: ((name: string) => void)
}[] = []
export function getEvents() {
    return events;
}
export function RegisterWorkerEvent(type: CronEvents, func: (name: string) => void, scope: string = 'default') {
    events.push({ type, scope, event: func });
}

export function clearModel() {
    scope = {};
    events = [];
}