import { $it } from 'jasmine-ts-async';

import { setConfig } from '../../../Modules/Config';

import { CronManager, RegisterWorker, RegisterWorkerEvent } from '../../../Modules/Worker';

describe("Module/Worker", () => {
    $it("test job", async () => {
        let prevNotBinded: boolean = false;
        let prevBinded: boolean = false;
        let counter = 0;

        RegisterWorker({ name: 'test', cronTime: "* * * * * * *" }, async prev => {
            if (prev) prevBinded = true;
            else prevNotBinded = true;
            counter++;
            await new Promise(r => setTimeout(r, 2000));
            return true;
        });

        setConfig({
            default: {
                "redisWorker": {
                    "Main": {
                        "port": 6379,
                        "host": "127.0.0.1",
                        "password": "qwerty"
                    }
                }
            }
        });

        const commander = new CronManager();
        await new Promise(r => commander.init(r));
        await new Promise(r => setTimeout(r, 4000));
        commander.destroy();

        expect(prevNotBinded).toBe(true);
        expect(prevBinded).toBe(true);
        expect(counter).toBeGreaterThan(0);
    });

    $it("test job lifecycle", async () => {
        let counter = 0;
        let counterStop = 0;
        let counterAfter = 0;
        let startCounter = 0;
        let stopCounter = 0;

        // TODO: test all events
        RegisterWorkerEvent('start', name => {
            expect(name).toBe('test');
            startCounter++;
        });

        RegisterWorkerEvent('stop', name => {
            expect(name).toBe('test');
            stopCounter++;
        });

        RegisterWorker({ name: 'test', cronTime: "* * * * * * *" }, async prev => {
            counter++;
            return true;
        });

        setConfig({
            default: {
                "redisWorker": {
                    "Main": {
                        "port": 6379,
                        "host": "127.0.0.1",
                        "password": "qwerty"
                    }
                }
            }
        });

        const commander = new CronManager();
        await new Promise(r => commander.init(r));
        await new Promise(r => setTimeout(r, 1500));
        commander.stopForce('test');
        counterAfter = counter + 0;
        await new Promise(r => setTimeout(r, 1500));
        counterStop = counter + 0;
        commander.start('test');
        await new Promise(r => setTimeout(r, 1500));
        commander.destroy();

        expect(counter).toBeGreaterThan(0);
        expect(counter).toBeGreaterThan(counterAfter);
        expect(counterAfter).toBe(counterStop);
        expect(startCounter).toBe(2);
        expect(stopCounter).toBe(2);
    });
});