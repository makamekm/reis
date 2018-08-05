jest.mock('net');

import { LogstashLogger } from '../../Server/Lib/LogstashLogger';
import { setConfig } from '../../Modules/Config';

declare var global: {
    onNetMessage: Function
}

describe("Server/Lib/LogstashLogger", () => {
    beforeEach(() => {
        setConfig({
            default: {
                "logLogstash": {
                    "host": "elk",
                    "port": 5801,
                    "tags": ["production", "test"],
                    "tries": 2,
                    "interval": 100,
                    "beat": "reiso_ex_full",
                    "type": "reiso_ex_full",
                    "level": "info"
                }
            }
        });
    });

    it("check level", async () => {
        let logger = new LogstashLogger();
        expect(logger.getLevel()).toBe('info');
    });

    it("send a message", async () => {
        let logger = new LogstashLogger();
        let catchedMessage;

        global.onNetMessage = function(message) {
            catchedMessage = message;
        }

        await logger.log('error', {
            test: 'Test'
        });

        expect(!!catchedMessage).toBeTruthy();

        if (!!catchedMessage) {
            const message = JSON.parse(catchedMessage);
            expect(message.test).toBe('Test');
            expect(message['@tags'][1]).toBe('test');
            expect(message['level']).toBe('error');
        }
    });
});