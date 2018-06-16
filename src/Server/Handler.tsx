import * as cron from 'cron';
import * as QueueRaw from 'bull';

import * as Log from '../Modules/Log';
import { getConfig } from '../Modules/Config';

export let scope: { [name: string]: { [name: string]: Job } } = {}

export function Queue(name: string, scope: string = 'Main') {
  return new QueueRaw(name, {
    redis: getConfig().redisJob[scope]
  });
}

export function getQueues() {
  let arr = [];

  for (let sc in scope) {
    for (let name in scope[sc]) {
      arr.push(new QueueRaw(name, {
        redis: getConfig().redisJob[sc]
      }));
    }
  }

  return arr;
}

export function getQueuesArena() {
  let arr = [];

  for (let sc in scope) {
    for (let name in scope[sc]) {
      arr.push({
        name,
        hostId: sc,
        ...getConfig().redisJob[sc]
      });
    }
  }

  return arr;
}

export interface Job {
  description?: string
  process(job): Promise<any>
  count?: number
  job?: any
}

export interface JobOption {
  name: string
  scope?: string
  description?: string
  count?: number
}

export function RegisterJob(opt: JobOption, func: (job: QueueRaw.Job) => (Promise<any> | any)) {
  if (!scope[opt.scope || 'Main']) scope[opt.scope || 'Main'] = {};
  scope[opt.scope || 'Main'][opt.name] = {
    count: opt.count || 1,
    description: opt.description,
    process: func
  }
}

export class JobManager {
  private jobs: { [name: string]: Job } = {}
  private name: string

  constructor(name: string = 'Main') {
    this.name = name;
    this.jobs = scope[name];
  }

  public getJob(name: string): Job {
    return this.jobs[name];
  }

  public async runJob<T>(j: Job, job: QueueRaw.Job): Promise<T> {
    return await j.process(job);
  }

  public hireJob(j: Job) {
    const processQueue = new QueueRaw(name, {
      redis: getConfig().redisJob[this.name]
    });

    processQueue.process(j.count, async (job: QueueRaw.Job, done) => {
      try {
        let result = await this.runJob(j, job);
        done(null, result);
        return result;
      }
      catch (e) {
        Log.logError(e, {
          name: name,
          scope: this.name,
          id: job.id,
          data: JSON.stringify(job.data),
          type: 'handler'
        });
        done(e, null);
      }
    });

    j.job = processQueue;
  }

  public init(callback?: (manager: JobManager) => void) {
    for (let name in this.jobs) {
      const job = this.getJob(name);
      this.hireJob(job);
    }
    if (callback) callback(this);
  }
}