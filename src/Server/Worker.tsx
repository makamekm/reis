import * as cron from 'cron';

import { Commander } from './Commander';
import * as Log from '../Modules/Log';

export let scope: { [name: string]: { [name: string]: Job } } = {}

export interface Job {
  cronTime: string
  start: boolean
  description: string
  onTick(previous: Date | null): Promise<boolean>
  job?: cron.CronJob | null
  current?: Date | null
  currentTick?: Promise<boolean>
}

export interface WorkerOption {
  name?: string
  scope?: string
  description: string
  cronTime: string
  start: boolean
  job?: cron.CronJob | null
  current?: Date | null
  currentTick?: Promise<boolean>
}

export function RegisterWorker(opt: WorkerOption) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>): any => {
    if (!scope[opt.scope || 'Main']) scope[opt.scope || 'Main'] = {};
    scope[opt.scope || 'Main'][opt.name || key] = {
      cronTime: opt.cronTime,
      start: opt.start,
      description: opt.description,
      onTick: descriptor.value
    }
  }
}

export type CronEvents = 'start' | 'stop' | 'run' | 'success' | 'fail' | 'finish';

export class CronManager {
  private jobs: { [name: string]: Job } = {}
  private events: {
    type: CronEvents
    event: ((name: string) => void)
  }[] = []

  public on(name: CronEvents, event: ((name: string) => void)) {
    this.events.push({
      type: name,
      event
    });
  }

  public unon(event: ((name: string) => void)) {
    let index = this.events.findIndex(s => s.event === event);
    if (index >= 0) this.events = this.events.splice(this.events.findIndex(s => s.event === event), 1);
  }

  constructor(name: string = 'Main') {
    this.jobs = scope[name];
  }

  public init() {
    for (var name in this.jobs) {
      const job = this.jobs[name];
      job.job = new cron.CronJob({
        cronTime: job.cronTime,
        onTick: () => {
          let current = new Date();
          let promise = job.onTick(job.current !== current && job.current);

          if (!job.current) {
            job.current = current;
            job.currentTick = promise;
          }

          this.events.filter(s => s.type == 'run').forEach(e => e.event(name));

          promise.then(r => {
            if (r !== false) {
              job.current = null;
              job.currentTick = null;
            }

            this.events.filter(s => s.type == 'success').forEach(e => e.event(name));
            this.events.filter(s => s.type == 'finish').forEach(e => e.event(name));
          }).catch(e => {
            job.current = null;
            job.currentTick = null;
            Log.fixError(e, 'worker', {
              name: name
            });

            this.events.filter(s => s.type == 'fail').forEach(e => e.event(name));
            this.events.filter(s => s.type == 'finish').forEach(e => e.event(name));
          });
        },
        start: job.start
      })
    }
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

    this.jobs[name].job.stop();

    this.jobs[name].currentTick = null;
    this.jobs[name].current = null;

    this.events.filter(s => s.type == 'stop').forEach(e => e.event(name));
  }

  public async stopForce(name) {
    this.jobs[name].job.stop();
    this.jobs[name].currentTick = null;
    this.jobs[name].current = null;

    this.events.filter(s => s.type == 'stop').forEach(e => e.event(name));
  }

  public start(name) {
    this.jobs[name].job.start();

    this.events.filter(s => s.type == 'start').forEach(e => e.event(name));
  }

  public status(name) {
    return this.jobs[name] && this.jobs[name].job && !!this.jobs[name].job.running;
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
}