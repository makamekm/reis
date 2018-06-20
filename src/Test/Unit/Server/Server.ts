// import { $it, $afterEach, $beforeEach } from 'jasmine-ts-async';
const findFreePorts = require('find-free-ports');
require("fetch-everywhere");
import "reflect-metadata";

import { setConfig } from '../../../Modules/Config';
import * as Log from '../../../Modules/Log';

import { Server } from '../../../Server/Server';
// import { route } from '../../../Modules/Router';

let originalTimeout: number;
let port: number;
let portWS: number;
const server: Server = new Server();

async function r() {
    [port, portWS] = await findFreePorts(2);

    setConfig({
        default: {
            "logConsole": {
                "level": "debug"
            },
            "logLogstash": null,
            "port": port,
            "portWS": portWS,
            "globalPort": port,
            "globalPortWS": portWS,
            "host": "127.0.0.1",
            "graphiql": true,
            "translation": "./translation.json",
            "uploadDir": "./test/uploads/",
            "publicDir": "./test/public/",
            "defaultLanguage": "en",
            "languages": ["en", "ru"],
            "quotaLimit": 100,
            "maxFileSize": 50,
            "redisPubSub": {
                "Main": {
                    "port": 6379,
                    "host": "127.0.0.1",
                    "password": "qwerty"
                }
            }
        }
    });

    process.env.MODE = 'server';

    Log.init();

    await server.start();
}

r();


// describe("Module/Server", () => {

//     $beforeEach(async () => {
//         originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
//         jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

//         [port, portWS] = await findFreePorts(2);

//         setConfig({
//             default: {
//                 "logConsole": null,
//                 "logLogstash": null,
//                 "port": port,
//                 "portWS": portWS,
//                 "globalPort": port,
//                 "globalPortWS": portWS,
//                 "host": "127.0.0.1",
//                 "graphiql": true,
//                 "translation": "./translation.json",
//                 "uploadDir": "./test/uploads/",
//                 "publicDir": "./test/public/",
//                 "defaultLanguage": "en",
//                 "languages": ["en", "ru"],
//                 "quotaLimit": 100,
//                 "maxFileSize": 50,
//                 "redisPubSub": {
//                   "Main": {
//                     "port": 6379,
//                     "host": "127.0.0.1",
//                     "password": "qwerty"
//                   }
//                 }
//             }
//         });

//         // await server.start();
//     });

//     $afterEach(async () => {
//         jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

//         // await server.stop();
//     });

//     $it("test start server", async () => {
//         expect(1).toBe(1);
//     });
// });