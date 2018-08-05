import { getClient, RedisClient } from '../../Modules/Redis';
import { setConfig } from '../../Modules/Config';

const host = "127.0.0.1";

describe("Module/Redis", () => {

    beforeAll(async () => {
        setConfig({
            default: {
                "redis": {
                    "Main": {
                        "port": 6379,
                        "host": host,
                        "password": "qwerty"
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