"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const QueueRaw = require("bull");
const Log = require("../Modules/Log");
const Config_1 = require("../Modules/Config");
exports.scope = {};
function Queue(name, scope = 'Main') {
    return new QueueRaw(name, {
        redis: {
            port: Config_1.getConfig().redis[scope].port,
            host: Config_1.getConfig().redis[scope].host,
            password: Config_1.getConfig().redis[scope].password
        }
    });
}
exports.Queue = Queue;
function getQueues() {
    let arr = [];
    for (let sc in exports.scope) {
        for (let name in exports.scope[sc]) {
            arr.push(new QueueRaw(name, {
                redis: {
                    port: Config_1.getConfig().redis[sc].port,
                    host: Config_1.getConfig().redis[sc].host,
                    password: Config_1.getConfig().redis[sc].password
                }
            }));
        }
    }
    return arr;
}
exports.getQueues = getQueues;
function getQueuesArena() {
    let arr = [];
    for (let sc in exports.scope) {
        for (let name in exports.scope[sc]) {
            arr.push({
                name,
                hostId: sc,
                port: Config_1.getConfig().redis[sc].port,
                host: Config_1.getConfig().redis[sc].host,
                password: Config_1.getConfig().redis[sc].password,
            });
        }
    }
    return arr;
}
exports.getQueuesArena = getQueuesArena;
function RegisterJob(opt) {
    return (target, key, descriptor) => {
        if (!exports.scope[opt.scope || 'Main'])
            exports.scope[opt.scope || 'Main'] = {};
        exports.scope[opt.scope || 'Main'][opt.name || key] = {
            count: opt.count || 1,
            description: opt.description,
            process: descriptor.value
        };
    };
}
exports.RegisterJob = RegisterJob;
class JobManager {
    constructor(name = 'Main') {
        this.jobs = {};
        this.name = name;
        this.jobs = exports.scope[name];
        this.config = {
            port: Config_1.getConfig().redis[this.name].port,
            host: Config_1.getConfig().redis[this.name].host,
            password: Config_1.getConfig().redis[this.name].password
        };
    }
    init() {
        for (let name in this.jobs) {
            const j = this.jobs[name];
            const processQueue = new QueueRaw(name, {
                redis: this.config
            });
            processQueue.process(j.count, (job, done) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    let result = yield j.process(job);
                    done(null, result);
                    return result;
                }
                catch (e) {
                    Log.fixError(e, 'handler', {
                        name: name,
                        scope: exports.scope,
                        id: job.id,
                        data: job.data
                    });
                    done(e, null);
                }
            }));
            j.job = processQueue;
        }
    }
}
exports.JobManager = JobManager;
//# sourceMappingURL=Handler.js.map