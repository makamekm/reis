import redis = require("redis");
const cron = require("cron-cluster");

import * as Log from '../Modules/Log';
import { getConfig } from '../Modules/Config';
import { Job } from './Lib/Worker';
import { getJobs, getEvents } from './Worker';

export type CronEvents = 'start' | 'stop' | 'run' | 'success' | 'fail' | 'finish';

export class CronManager {
    protected scope: string
    protected jobs: { [name: string]: Job } = {}
    protected cacheClient: redis.RedisClient
    protected CronJob

    constructor(name: string = 'Main') {
        this.scope = name;
        this.jobs = getJobs(name);
        this.cacheClient = redis.createClient(getConfig().redisWorker[this.scope]);
        this.CronJob = cron(this.cacheClient).CronJob;
    }

    public getJob(name: string): Job {
        return this.jobs[name];
    }

    public async runJob(job: Job, prevRun: Date | null) {
        return await job.onTick(prevRun);
    }

    protected getEvents(type: CronEvents) {
        return getEvents().filter(s => s.type == type && (!s.scope || s.scope == this.scope));
    }

    genCronJob(job: Job, name) {
        return new this.CronJob(job.cronTime, () => {
            const current = new Date();
            const promise = this.runJob(job, job.current !== current && job.current);

            if (!job.current) {
                job.current = current;
                job.currentTick = promise;
            }

            this.getEvents('run').forEach(e => e.event(name));

            promise.then(r => {
                if (r !== false) {
                    job.current = null;
                    job.currentTick = null;
                }

                this.getEvents('success').forEach(e => e.event(name));
                this.getEvents('finish').forEach(e => e.event(name));
            }).catch(e => {
                job.current = null;
                job.currentTick = null;

                Log.logError(e, {
                    name,
                    type: 'worker'
                });

                this.getEvents('fail').forEach(e => e.event(name));
                this.getEvents('finish').forEach(e => e.event(name));
            });
        });
    }

    public init(callback?: (manager: CronManager) => void) {
        for (const name in this.jobs) {
            const job = this.getJob(name);
            job.cronJob = this.genCronJob(job, name);
            job.cronJob.start();
            this.getEvents('start').forEach(e => e.event(name));
        }
        if (callback) callback(this);
    }

    public async stop(name) {
        if (this.isRunning(name)) {
            try {
                await this.jobs[name].currentTick;
            }
            catch (e) {
                throw e;
            }
        }

        this.jobs[name].cronJob.stop();

        this.jobs[name].currentTick = null;
        this.jobs[name].current = null;

        this.getEvents('stop').forEach(e => e.event(name));
    }

    public async stopForce(name) {
        this.jobs[name].cronJob.stop();
        this.jobs[name].currentTick = null;
        this.jobs[name].current = null;

        this.getEvents('stop').forEach(e => e.event(name));
    }

    public start(name) {
        this.jobs[name].cronJob.start();
        this.getEvents('start').forEach(e => e.event(name));
    }

    public status(name) {
        return this.jobs[name] && this.jobs[name].cronJob && !!this.jobs[name].cronJob.running;
    }

    public isRunning(name) {
        return this.jobs[name] && !!this.jobs[name].current;
    }

    public isJob(name) {
        return !!this.jobs[name];
    }

    public getNames(): string[] {
        return Object.getOwnPropertyNames(this.jobs);
    }

    public destroy() {
        for (const name in this.jobs) {
            this.jobs[name].cronJob.stop();
            this.jobs[name].currentTick = null;
            this.jobs[name].current = null;

            this.getEvents('stop').forEach(e => e.event(name));
        }
    }
}