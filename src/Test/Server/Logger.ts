import { setConfig } from '../../Modules/Config';

import * as Log from '../../Modules/Log';

describe("Module/Logger", () => {
    it("levels & addLogger", () => {
        type Logs = {
            debug: string[]
            info: string[]
            warn: string[]
            error: string[]
        };

        const debug: Logs = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };

        const info: Logs = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };

        const warn: Logs = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };

        const error: Logs = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };

        setConfig({
            default: {
                "logConsole": null,
                "logLogstash": null,
                "logAdditional": {
                    "additional": "ads"
                }
            }
        });

        Log.init();
        Log.LoggerManager.addLogger({
            log(level, line) {
                debug[level].push(JSON.stringify(line));
            },
            getLevel() {
                return 'debug';
            }
        });
        Log.LoggerManager.addLogger({
            log(level, line) {
                info[level].push(JSON.stringify(line));
            },
            getLevel() {
                return 'info';
            }
        });
        Log.LoggerManager.addLogger({
            log(level, line) {
                warn[level].push(JSON.stringify(line));
            },
            getLevel() {
                return 'warn';
            }
        });
        Log.LoggerManager.addLogger({
            log(level, line) {
                error[level].push(JSON.stringify(line));
            },
            getLevel() {
                return 'error';
            }
        });

        Log.logDebug('test');
        Log.logInfo('test');
        Log.logWarn('test');
        Log.logError(new Error('test'));

        expect(debug.info.find(s => s.indexOf('test') >= 0 && s.indexOf('additional') >= 0 && s.indexOf('ads') >= 0)).not.toBeNull();

        expect(debug.debug.length).toBe(1);
        expect(debug.info.length).toBe(1);
        expect(debug.warn.length).toBe(1);
        expect(debug.error.length).toBe(1);

        expect(info.debug.length).toBe(0);
        expect(info.info.length).toBe(1);
        expect(info.warn.length).toBe(1);
        expect(info.error.length).toBe(1);

        expect(warn.debug.length).toBe(0);
        expect(warn.info.length).toBe(0);
        expect(warn.warn.length).toBe(1);
        expect(warn.error.length).toBe(1);

        expect(error.debug.length).toBe(0);
        expect(error.info.length).toBe(0);
        expect(error.warn.length).toBe(0);
        expect(error.error.length).toBe(1);
    });
});