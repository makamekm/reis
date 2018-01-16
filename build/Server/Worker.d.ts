import * as cron from 'cron';
export declare let scope: {
    [name: string]: {
        [name: string]: Job;
    };
};
export interface Job {
    cronTime: string;
    start: boolean;
    description: string;
    onTick(previous: Date | null): Promise<boolean>;
    job?: cron.CronJob | null;
    current?: Date | null;
    currentTick?: Promise<boolean>;
}
export interface WorkerOption {
    name?: string;
    scope?: string;
    description: string;
    cronTime: string;
    start: boolean;
    job?: cron.CronJob | null;
    current?: Date | null;
    currentTick?: Promise<boolean>;
}
export declare function RegisterWorker(opt: WorkerOption): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => any;
export declare type CronEvents = 'start' | 'stop' | 'run' | 'success' | 'fail' | 'finish';
export declare class CronManager {
    private jobs;
    private events;
    on(name: CronEvents, event: ((name: string) => void)): void;
    unon(event: ((name: string) => void)): void;
    constructor(name?: string);
    init(): void;
    stop(name: any): Promise<void>;
    stopForce(name: any): Promise<void>;
    start(name: any): void;
    status(name: any): boolean;
    isRunning(name: any): boolean;
    isJob(name: any): boolean;
    getNames(): string[];
}
