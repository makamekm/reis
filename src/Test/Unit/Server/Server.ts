import { $it, $afterEach, $beforeEach } from 'jasmine-ts-async';
const findFreePorts = require('find-free-ports');

import { setConfig } from '../../../Modules/Config';

import { Server } from '../../../Server/Server';
// import { route } from '../../../Modules/Router';

describe("Module/Server", () => {

    let originalTimeout: number;
    let port: number;
    let portWS: number;
    let server: Server;

    $beforeEach(async () => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        [port, portWS] = await findFreePorts(2);

        setConfig({
            default: {
                "logConsole": null,
                "logLogstash": null,
                "port": port,
                "portWS": portWS,
                "globalPort": port,
                "globalPortWS": portWS,
            }
        });

        server = new Server();
        // await server.start();
    });

    $afterEach(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

        // await server.stop();
    });

    $it("test start server", async () => {
        console.log('good');
    });
});