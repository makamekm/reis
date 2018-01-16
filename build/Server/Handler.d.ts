/// <reference types="bull" />
import * as QueueRaw from 'bull';
export declare let scope: {
    [name: string]: {
        [name: string]: Job;
    };
};
export declare function Queue(name: string, scope?: string): QueueRaw.Queue;
export declare function getQueues(): any[];
export declare function getQueuesArena(): any[];
export interface Job {
    description: string;
    process(job: any): Promise<any>;
    count?: number;
    job?: any;
}
export interface JobOption {
    name?: string;
    scope?: string;
    description?: string;
    count?: number;
}
export declare function RegisterJob(opt: JobOption): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => any;
export declare class JobManager {
    private jobs;
    private name;
    private config;
    constructor(name?: string);
    init(): void;
}
