import * as React from 'react';
import ws = require('ws');
const { spawn } = require('child_process');
const path = require('path');

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import * as ApolloClient from 'apollo-client';
import * as ApolloLinkWS from "apollo-link-ws";
import * as ApolloCache from 'apollo-cache-inmemory';
import { gql } from 'apollo-server';
import { GraphQLScalarType, Kind } from 'graphql';

import { createApolloFetch } from 'apollo-fetch';
const findFreePorts = require('find-free-ports');
const cheerio = require('cheerio');
require("fetch-everywhere");
import "reflect-metadata";

import { setConfig } from '../../Modules/Config';
import * as Log from '../../Modules/Log';
import * as Error from '../../Modules/Error';

import { Server } from '../../Server/Server';
import * as Router from '../../Modules/Router';
import * as Query from '../../Modules/Query';
import * as Hook from '../../Modules/ServerHook';
import * as Model from '../../Modules/Model';
import { genLink } from '../../Client/Link';

export const uploadType = new GraphQLScalarType({
    name: 'Upload',
    serialize: value => {
        return value;
    },
    parseValue: value => {
        return value;
    },
    parseLiteral: ast => {
        if (ast.kind !== Kind.STRING) {
            throw new Error.LogError(null, 'debug', 'Upload can only parse strings got a: ' + ast.kind, "UP0", 422);
        }
        return ast.value;
    }
});

let port: number;
let portWS: number;
let host = "127.0.0.1";
const server: Server = new Server();

describe("Module/Server", () => {

    let hook: Function

    function setTestGraphQLModel() {
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
            int: number = 33

            @Query.Field("float")
            float: number

            @Query.Field("string")
            str: string

            @Query.Field(type => TestSubstructure, { array: true })
            async sub(@Query.Arg("string", 'str') str: string, @Query.Arg(type => TestInput, 'sub') sub: TestInput, @Query.Arg('integer', 'empty', { nullable: true }) empty: number): Promise<TestSubstructure[]> {
                const res1 = new TestSubstructure();
                const res2 = new TestSubstructure();

                await Query.Publish('test', {
                    test: sub.int
                })

                res1.str = str;
                res2.float = sub.float;
                res2.int = sub.int;
                res2.str = sub.str;

                return [res1, res2];
            }
        }

        @Query.Query("test")
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

        Query.Subscription(
            type => TestSubstructure,
            function (id: number, context) {
                if (hook) hook();
                return Query.Subscribe('test', function (data) {
                    return data && data.test === id;
                });
            },
            {
                name: 'test',
                args: [Query.SubscriptionArg('integer', 'id')]
            }
        )(
            async function subscription(id: number, context, data): Promise<TestSubstructure> {
                const res = new TestSubstructure();
                res.int = id;
                return res;
            })
    }

    beforeAll(async () => {
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
        Log.LoggerManager.addLogger({
            log(level, line) {
                console.error(level, line);
            },
            getLevel() {
                return 'error';
            }
        });

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

    beforeEach(async () => {
        Router.cleanRoutes();
        Query.clearModel();
        Hook.clearWebHook();
        Model.clearModels();
    });

    afterEach(async () => {
        await server.stop();
    });

    it("start & render", async () => {
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

    it("router", async () => {
        Router.route('/*', data => {
            return <div data-test="test">
                test
            </div>
        })

        await server.start();

        let res = await fetch(`http://${host}:${port}/`);
        let body = await res.text();
        let $ = cheerio.load(body, { decodeEntities: false });
        expect($('[data-test=test]').text()).toBe('test');
    });

    it("mobx", async () => {

        @Model.model<TestModel>('test')
        class TestModel implements Model.IModel {
            @observable id = Math.random()
            @observable data: string = "test"

            constructor(initialState: Model.Jsonable) {
                if (initialState) {
                    this.id = initialState.id as number;
                    this.data = initialState.data as string;
                }
            }

            toJson() {
                return {
                    data: 'test'
                }
            }
        }

        const Test = inject('test')(observer(function (props) {
            return <div data-test="test">
                {props.test.data}
            </div>
        }));

        Router.route('/*', data => {
            return <Test />
        })

        await server.start();

        let res = await fetch(`http://${host}:${port}/`);
        let body = await res.text();
        let $ = cheerio.load(body, { decodeEntities: false });
        expect($('[data-test=test]').text()).toBe('test');
    });

    it("graphql", async () => {
        setTestGraphQLModel();

        await server.start();

        const fetch = createApolloFetch({
            uri: `http://${host}:${port}/graphql`
        });

        let res = await fetch({
            query: `query Test($str: String!, $sub: TestInput!) {
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
            }`,
            variables: {
                str: "Hello",
                sub: {
                    int: 12,
                    float: 21.2,
                    str: 'World'
                }
            }
        });

        expect(JSON.stringify(res)).toBe(JSON.stringify(JSON.parse(JSON.stringify({
            "data": {
                "test": {
                    "int": null,
                    "str": null,
                    "sub": {
                        "int": 33,
                        "float": null,
                        "sub": [
                            {
                                "int": null,
                                "float": null,
                                "str": "Hello"
                            },
                            {
                                "int": 12,
                                "float": 21.2,
                                "str": "World"
                            }
                        ]
                    }
                }
            }
        }))));
    });

    it("webhook", async () => {
        const data = {
            test: 'Test'
        }

        Hook.RegisterWebHook({
            path: 'test'
        }, (params, body, context) => {
            expect(JSON.stringify(body)).toBe(JSON.stringify(data));
            return data
        });

        Hook.RegisterWebHook({
            path: 'authtest',
            isAuth: () => true,
            auth: (username, password, params, body, context) => username == 'test' && password == 'test'
        }, (params, body, context) => {
            expect(JSON.stringify(body)).toBe(JSON.stringify(data));
            return data;
        });

        await server.start();

        let res = await fetch(`http://${host}:${port}/wh/test`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        let body = await res.text();
        expect(body).toBe(JSON.stringify(data));

        res = await fetch(`http://${host}:${port}/wh/authtest`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Authorization": "Basic " + new Buffer('test' + ":" + 'test').toString("base64"),
                "Content-Type": "application/json"
            }
        });
        body = await res.text();
        expect(body).toBe(JSON.stringify(data));

        res = await fetch(`http://${host}:${port}/wh/authtest`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Authorization": "Basic " + new Buffer('test' + ":" + 'not').toString("base64"),
                "Content-Type": "application/json"
            }
        });
        body = await res.text();

        expect(body).toBe('Unauthorized');
    });

    it("websocket", async () => {
        setTestGraphQLModel();

        await server.start();

        const wsAddress = "ws://" + host + ":" + portWS + "/";
        const context: any = {};
        const wsLink = new ApolloLinkWS.WebSocketLink({
            uri: wsAddress,
            webSocketImpl: ws,
            options: {
                reconnect: false,
                connectionParams: context
            }
        });
        const cache = new ApolloCache.InMemoryCache();

        const fetch = createApolloFetch({
            uri: `http://${host}:${port}/graphql`
        });

        let catched = false;

        await new Promise(async (r, e) => {
            const gqlClient = new ApolloClient.ApolloClient({
                link: wsLink,
                cache,
                ssrMode: true,
                queryDeduplication: true,
                defaultOptions: {
                    watchQuery: {
                        fetchPolicy: 'cache-and-network',
                        errorPolicy: 'ignore',
                    },
                    query: {
                        fetchPolicy: 'cache-and-network',
                        errorPolicy: 'all',
                    },
                    mutate: {
                        errorPolicy: 'all'
                    }
                }
            });

            await new Promise(h => {
                hook = h;
                gqlClient.subscribe({
                    query: gql`subscription TestSub($id: Int!) {
                        test(id: $id) {
                            int,
                            float,
                            str
                        }
                    }`,
                    variables: {
                        id: 12
                    }
                }).subscribe(value => {
                    catched = true;
                    expect(JSON.stringify(value)).toBe(JSON.stringify({
                        "data": {
                            "test": {
                                "int": 12,
                                "float": null,
                                "str": null,
                                "__typename": "TestSubstructure"
                            }
                        }
                    }));
                    r();
                }, error => {
                    e(error);
                });
            });

            const req = `query Test($str: String!, $sub: TestInput!) {
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

            await Promise.all([
                await fetch({
                    query: req,
                    variables: {
                        str: "HelloIgnore",
                        sub: {
                            int: 10,
                            float: 21.2,
                            str: 'World'
                        }
                    }
                }),
                await fetch({
                    query: req,
                    variables: {
                        str: "Hello",
                        sub: {
                            int: 12,
                            float: 21.2,
                            str: 'World'
                        }
                    }
                })
            ]);
        });

        (wsLink as any).subscriptionClient.client.close();
        expect(catched).toBeTruthy();
    });

    it("upload", async () => {
        setTestGraphQLModel();

        let catched = false;

        @Query.Mutation({ name: 'upload' })
        @Query.Structure('UploadRoot')
        class UploadRoot {
            @Query.Field("string", { name: "do" })
            public async do(
                @Query.Arg(type => uploadType, 'file') fileId: string,
                context: { language: string, files: any[] }
            ) {
                let file = context.files.find(f => f.fieldname == fileId);
                catched = true;
                expect(context.files.length).toBe(1);
                expect(file.originalname).toBe('test.txt');
            }
        }

        await server.start();
        
        await new Promise((r, e) => {
            var cp = spawn('node_modules/.bin/cross-env', [`HOST_CONFIG=${JSON.stringify({
                host,
                port,
                portWS
            })}`, 'npm', 'run', 'test_client', '--testPathPattern', "src\\/Test\\/Client\\/Upload\\.(ts?|tsx?)$"], { stdio: ['pipe'], cwd: path.resolve(__dirname, '../../..') });

            cp.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            cp.stderr.on('data', function (data) {
                console.log(data.toString());
            });
    
            cp.on('close', function (code) {
                if (code === 0) {
                    r();
                } else {
                    e("Client testing has sent an error code: " + code);
                }
            });
        })

        expect(catched).toBeTruthy();
    }, 20000);

    // it("ddos", async () => {
    // });
});