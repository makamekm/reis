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
import * as Query from '../../../Modules/Query';

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

    // $it("mobx", async () => {
    // });

    $it("graphql", async () => {
        @Query.Input("TestInput")
        class TestInput {
            @Query.InputField("integer", { nullable: true })
            int?: number

            @Query.InputField("float")
            float: number

            @Query.InputField("string", { nullable: true })
            str?: string
        }

        @Query.Structure("TestSubstructure")
        class TestSubstructure {
            parent: TestResult

            @Query.Field("integer")
            int: number

            @Query.Field("float")
            float: number

            @Query.Field("string")
            str: string
        }

        @Query.Structure("TestResult")
        class TestResult {
            @Query.Field("integer")
            int: number

            @Query.Field("float")
            float: number

            @Query.Field("string")
            str: string

            @Query.Field(type => TestSubstructure, { array: true })
            sub(@Query.Arg("string", 'str') str: string, @Query.Arg(type => TestInput, 'sub') sub: TestInput, @Query.Arg('integer', 'empty', {nullable: true}) empty: number): TestSubstructure[] {
                const res1 = new TestSubstructure();
                const res2 = new TestSubstructure();

                res1.str = str;
                res2.float = sub.float;
                res2.int = sub.int;
                res2.str = sub.str;

                return [res1, res2];
            }
        }

        @Query.Query({ name: 'test' })
        @Query.Structure("Test")
        class Test {
            @Query.Field("integer")
            int: number

            @Query.Field("float")
            float: number

            @Query.Field("string")
            str: string

            @Query.Field(type => TestResult, { substructure: true })
            sub: TestResult
        }

        await server.start();

        const query = `mutation Auth($login: String, $password: Password!) {
            test {
                int,
                str,
                sub {
                    int,
                    float,
                    sub(str: $str, sub: $sub) {
                        int,
                        float,
                        str
                    }
                }
            }
        }`;

        let res = await fetch(`http://${host}:${port}/graphql`, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables: {
                    str: "Hello",
                    sub: {
                        int: 12,
                        float: 21.2,
                        str: 'World'
                    }
                }
            })
        });
        let body = await res.text();
        console.log(body)
        // let $ = cheerio.load(body, { decodeEntities: false });
        // expect($('[data-test=test]').text()).toBe('Test');

        Query.clearModel();
    });

    // $it("webhook", async () => {
    // });

    // $it("websocket", async () => {
    // });

    // $it("upload", async () => {
    // });

    // $it("ddos", async () => {
    // });
});