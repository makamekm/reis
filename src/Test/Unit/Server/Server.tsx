import * as React from 'react';
import { $it, $afterEach, $beforeEach, $beforeAll, $afterAll } from 'jasmine-ts-async';
const findFreePorts = require('find-free-ports');
const cheerio = require('cheerio');
require("fetch-everywhere");
import "reflect-metadata";

import { setConfig } from '../../../Modules/Config';
import * as Log from '../../../Modules/Log';

import { Server } from '../../../Server/Server';
import * as Router from '../../../Modules/Router';

let originalTimeout: number;
let port: number;
let portWS: number;
let host = "127.0.0.1";
const server: Server = new Server();

describe("Module/Server", () => {

    $beforeAll(async () => {
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
                "host": host,
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
                        "host": host,
                        "password": "qwerty"
                    }
                }
            }
        });

        process.env.MODE = 'server';
        Log.init();

        Router.DeclareHtml()(
            Router.withRouter(
                function html(props) {
                    return <div>
                        {props.children}
                    </div>
                }
            )
        );
    });
    
    $afterAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    })

    $beforeEach(async () => {
        Router.cleanRoutes();
    });

    $afterEach(async () => {
        await server.stop();
    });

    $it("start & render", async () => {
        Router.route('/*', data => {
            return <div data-test="test">
                Test
                </div>
        })

        await server.start();

        let res = await fetch(`http://${host}:${port}/`);
        let body = await res.text();
        let $ = cheerio.load(body, { decodeEntities: false });
        expect($('[data-test=test]').text()).toBe('Test');
    });

    $it("graphql", async () => {
    });

    $it("websocket", async () => {
    });

    $it("upload", async () => {
    });
});