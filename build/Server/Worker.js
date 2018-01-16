"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cron = require("cron");
const Log = require("../Modules/Log");
exports.scope = {};
function RegisterWorker(opt) {
    return (target, key, descriptor) => {
        if (!exports.scope[opt.scope || 'Main'])
            exports.scope[opt.scope || 'Main'] = {};
        exports.scope[opt.scope || 'Main'][opt.name || key] = {
            cronTime: opt.cronTime,
            start: opt.start,
            description: opt.description,
            onTick: descriptor.value
        };
    };
}
exports.RegisterWorker = RegisterWorker;
class CronManager {
    constructor(name = 'Main') {
        this.jobs = {};
        this.events = [];
        this.jobs = exports.scope[name];
    }
    on(name, event) {
        this.events.push({
            type: name,
            event
        });
    }
    unon(event) {
        let index = this.events.findIndex(s => s.event === event);
        if (index >= 0)
            this.events = this.events.splice(this.events.findIndex(s => s.event === event), 1);
    }
    init() {
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
            });
        }
    }
    stop(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.isRunning(name)) {
                try {
                    yield this.jobs[name].currentTick;
                }
                catch (e) {
                    throw e;
                }
            }
            this.jobs[name].job.stop();
            this.jobs[name].currentTick = null;
            this.jobs[name].current = null;
            this.events.filter(s => s.type == 'stop').forEach(e => e.event(name));
        });
    }
    stopForce(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.jobs[name].job.stop();
            this.jobs[name].currentTick = null;
            this.jobs[name].current = null;
            this.events.filter(s => s.type == 'stop').forEach(e => e.event(name));
        });
    }
    start(name) {
        this.jobs[name].job.start();
        this.events.filter(s => s.type == 'start').forEach(e => e.event(name));
    }
    status(name) {
        return this.jobs[name] && this.jobs[name].job && !!this.jobs[name].job.running;
    }
    isRunning(name) {
        return this.jobs[name] && !!this.jobs[name].current;
    }
    isJob(name) {
        return !!this.jobs[name];
    }
    getNames() {
        return Object.getOwnPropertyNames(this.jobs);
    }
}
exports.CronManager = CronManager;
//# sourceMappingURL=Worker.js.map