import * as QueueRaw from 'bull';

import * as Log from '../Modules/Log';
import { getConfig } from '../Modules/Config';

export let scope: { [name: string]: { [name: string]: Handler } } = {}

export function Queue(name: string, scope: string = 'Main') {
  return new QueueRaw(name, {
    redis: getConfig().redisHandler[scope]
  });
}

export function getQueues() {
  let arr = [];

  for (let sc in scope) {
    for (let name in scope[sc]) {
      arr.push(new QueueRaw(name, {
        redis: getConfig().redisHandler[sc]
      }));
    }
  }

  return arr;
}

export function clearModel() {
  scope = {};
}

export function getQueuesArena() {
  let arr = [];

  for (let sc in scope) {
    for (let name in scope[sc]) {
      arr.push({
        name,
        hostId: sc,
        ...getConfig().redisHandler[sc]
      });
    }
  }

  return arr;
}

export interface Handler {
  description?: string
  process(job): Promise<any>
  count?: number
  job?: any
}

export interface HandlerOption {
  name: string
  scope?: string
  description?: string
  count?: number
}

export function RegisterHandler(opt: HandlerOption, func: (job: QueueRaw.Job) => (Promise<any> | any)) {
  if (!scope[opt.scope || 'Main']) scope[opt.scope || 'Main'] = {};
  scope[opt.scope || 'Main'][opt.name] = {
    count: opt.count || 1,
    description: opt.description,
    process: func
  }
}

export class HandlerManager {
  private jobs: { [name: string]: Handler } = {}
  private name: string

  constructor(name: string = 'Main') {
    this.name = name;
    this.jobs = scope[name];
  }

  public getHandler(name: string): Handler {
    return this.jobs[name];
  }

  public async runHandler<T>(j: Handler, job: QueueRaw.Job): Promise<T> {
    return await j.process(job);
  }

  public hireHandler(j: Handler, name: string) {
    const processQueue = new QueueRaw(name, {
      redis: getConfig().redisHandler[this.name]
    });

    processQueue.process(j.count, async (job: QueueRaw.Job, done) => {
      try {
        let result = await this.runHandler(j, job);
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

  public init(callback?: (manager: HandlerManager) => void) {
    for (let name in this.jobs) {
      const job = this.getHandler(name);
      this.hireHandler(job, name);
    }
    if (callback) callback(this);
  }

  public async cleanAll() {
    for (const name in this.jobs) {
      await this.jobs[name].job.empty();
    }
  }

  public async destroy() {
    for (const name in this.jobs) {
      await this.jobs[name].job.close();
    }
  }
}