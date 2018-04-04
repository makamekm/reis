import * as cron from 'cron';
import * as QueueRaw from 'bull';

import * as Log from '../Modules/Log';
import { getConfig } from '../Modules/Config';

export let scope: { [name: string]: { [name: string]: Job } } = {}

export function Queue(name: string, scope: string = 'Main') {
  return new QueueRaw(name, {
    redis: {
      port: getConfig().redis[scope].port,
      host: getConfig().redis[scope].host,
      password: getConfig().redis[scope].password
    }
  });
}

export function getQueues() {
  let arr = [];

  for (let sc in scope) {
    for (let name in scope[sc]) {
      arr.push(new QueueRaw(name, {
        redis: {
          port: getConfig().redis[sc].port,
          host: getConfig().redis[sc].host,
          password: getConfig().redis[sc].password
        }
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
        port: getConfig().redis[sc].port,
        host: getConfig().redis[sc].host,
        password: getConfig().redis[sc].password,
      });
    }
  }

  return arr;
}

export interface Job {
  description: string
  process(job): Promise<any>
  count?: number
  job?: any
}

export interface JobOption {
  name?: string
  scope?: string
  description?: string
  count?: number
}

export function RegisterJob(opt: JobOption) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>): any => {
    if (!scope[opt.scope || 'Main']) scope[opt.scope || 'Main'] = {};
    scope[opt.scope || 'Main'][opt.name || key] = {
      count: opt.count || 1,
      description: opt.description,
      process: descriptor.value
    }
  }
}

export class JobManager {
  private jobs: { [name: string]: Job } = {}
  private name: string
  private config

  constructor(name: string = 'Main') {
    this.name = name;
    this.jobs = scope[name];
    this.config = {
      port: getConfig().redis[this.name].port,
      host: getConfig().redis[this.name].host,
      password: getConfig().redis[this.name].password
    };
  }

  public init() {
    for (let name in this.jobs) {
      const j = this.jobs[name];

      const processQueue = new QueueRaw(name, {
        redis: this.config
      });

      processQueue.process(j.count, async (job, done) => {
        try {
          let result = await j.process(job);
          done(null, result);
          return result;
        }
        catch (e) {
          Log.logError(e, 'handler', {
            name: name,
            scope: scope,
            id: job.id,
            data: job.data
          });
          done(e, null);
        }
      });

      j.job = processQueue;
    }
  }
}