import { setConfig } from '../../Modules/Config';
import { RegisterHandler, HandlerManager, Queue } from '../../Modules/Handler';

describe("Module/Handler", () => {
    it("run job", async () => {
        let counter = 0;

        RegisterHandler({ name: 'test', count: 1 }, async job => {
            expect(job.data.value).toBe('test');
            counter++;
            return 'test_result';
        });

        setConfig({
            default: {
                "redisHandler": {
                    "Main": {
                        "port": 6379,
                        "host": "127.0.0.1",
                        "password": "qwerty"
                    }
                }
            }
        });

        const commander = new HandlerManager();
        await new Promise(r => commander.init(r));

        await commander.cleanAll();

        await (await Queue('test').add({value: 'test'})).finished();
        const result = await (await Queue('test').add({value: 'test'})).finished();

        await commander.cleanAll();
        await commander.destroy();

        expect(counter).toBe(2);
        expect(result).toBe('test_result');
    }, 10000);
});