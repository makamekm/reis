jest.mock('cluster');

import { runCluster } from '../../Server/Lib/EntryRunner';
import { setConfig } from '../../Modules/Config';

declare var global: {
    onFork: Function
    isMaster: boolean
}

describe("Server/Lib/EntryRunner", () => {
    it("0 cores", async () => {
        setConfig({
            default: {
                "cores": null
            }
        });

        let run = false;

        runCluster(() => {
            run = true;
        }, true);

        expect(run).toBeTruthy();
    });

    it("2 cores from Master", async () => {
        setConfig({
            default: {
                "cores": 2
            }
        });

        const runs = [];

        global.isMaster = true;

        global.onFork = () => {
            runs.push(true);
        }

        runCluster(() => {
            runs.push(true);
        }, true);

        expect(runs.length).toBe(2);
    });

    it("2 cores from Fork", async () => {
        setConfig({
            default: {
                "cores": 2
            }
        });

        const runs = [];

        global.isMaster = false;

        global.onFork = () => {
            runs.push(true);
        }

        runCluster(() => {
            runs.push(true);
        }, true);

        expect(runs.length).toBe(1);
    });
});