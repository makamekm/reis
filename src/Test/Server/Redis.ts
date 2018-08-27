import { getClient, RedisClient } from '../../Modules/Redis';
import { setConfig } from '../../Modules/Config';

describe("Module/Redis", () => {

    beforeAll(async () => {
        setConfig({
            default: {
                "redis": {
                    "Main": {
                        "port": 6379,
                        "host": "redis",
                        "password": ""
                    }
                }
            }
        });
    });
    
    it("set & get", async () => {
        const client = getClient();
        await client.set('test', 'TestValue');

        expect(await client.get('test')).toBe('TestValue');
    });
});