import { WorkerOption, Job } from './Lib/Worker';
export * from './CronManager';
import { CronEvents } from './CronManager';

const scope: { [name: string]: { [name: string]: Job } } = {}
export function getJobs(name: string) {
    return scope[name];
}
export function RegisterWorker(opt: WorkerOption, func: (previous: Date | null) => Promise<boolean>) {
    if (!scope[opt.scope || 'Main']) scope[opt.scope || 'Main'] = {};
    scope[opt.scope || 'Main'][opt.name] = {
        cronTime: opt.cronTime,
        onTick: func
    }
}

const events: {
    type: CronEvents
    scope: string
    event: ((name: string) => void)
}[] = []
export function getEvents() {
    return events;
}
export function RegisterWorkerEvent(scope: string, type: CronEvents, func: (name: string) => void) {
    events.push({ type, scope, event: func });
}