"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const graphqlHTTP = require("apollo-server-express");
const graphql = require("graphql");
const subscriptionServer = require("subscriptions-transport-ws");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const compression = require("compression");
const seaport = require("seaport");
// import ddos = require('ddos');
// import ddos from 'ddos';
// Config
const Config_1 = require("../Modules/Config");
const Translation = require("../Modules/Translation");
const ORM = require("../Modules/ORM");
const Query = require("../Modules/Query");
const Log = require("../Modules/Log");
const WebHook = require("../Modules/WebHook");
const ServerHook_1 = require("../Modules/ServerHook");
const Render_1 = require("../Server/Render");
// Catch errors
function parseError(error, type = 'graphql') {
    Log.fixError(error, type);
    let result = {
        status: error.originalError && error.originalError.status,
        type: error.type ? error.type : (error.originalError ? error.originalError.constructor.name : error.constructor.name),
        state: error.originalError && error.originalError.state,
        message: error.message,
        path: error.path,
        errors: error.graphQLErrors ? error.graphQLErrors.map(e => parseError(e, type)) : []
    };
    if (process.env.NODE_ENV == 'development') {
        result['locations'] = error.locations;
        result['trace'] = error.trace ? error.trace : error.stack;
    }
    return result;
}
exports.parseError = parseError;
class Server {
    constructor(dirPath) {
        this.dirPath = null;
        this.dirPath = dirPath;
    }
    test() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield ORM.Manager.Test();
        });
    }
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.test();
            this.config();
            this.setFileUpload();
            this.setGraphQL();
            this.setWebHook();
            this.setRender();
            this.setSubscription();
            this.run();
        });
    }
    config() {
        this.app = express();
        Config_1.getConfig().port && this.app.set('port', Config_1.getConfig().port);
        this.app.use(cookieParser());
        // this.app.set('trust proxy', 1); // trust first proxy
        this.app.use(helmet());
        this.app.use(compression());
        this.app.disable('x-powered-by');
        this.app.use(bodyParser.json());
        // if (process.env.NODE_ENV == 'production') {
        //   this.app.use(new ddos({
        //     testmode: false,
        //     maxcount: 30,
        //     burst: 3,
        //     limit: 120,
        //     maxexpiry: 60,
        //     checkinterval: 1,
        //     errormessage: "{ message: 'DDoS Protection, try later (maximum 60 seconds)' }",
        //     responseStatus: 429
        //   }).express);
        // }
        this.app.get('*.js', (req, res, next) => {
            if (fs.existsSync(path.resolve(this.dirPath || __dirname, 'public', req.url.replace(/^((http|https):\/\/[\w\.:]+\/)|^(\/)/, '')) + '.gz')) {
                req.url = req.url + '.gz';
                res.set('Content-Type', 'text/javascript');
                res.set('Content-Encoding', 'gzip');
            }
            next();
        });
        this.app.get('*.css', (req, res, next) => {
            if (fs.existsSync(path.resolve(this.dirPath || __dirname, 'public', req.url.replace(/^((http|https):\/\/[\w\.:]+\/)|^(\/)/, '')) + '.gz')) {
                req.url = req.url + '.gz';
                res.set('Content-Type', 'text/css');
                res.set('Content-Encoding', 'gzip');
            }
            next();
        });
        this.app.use(this.logErrors);
        this.app.use(express.static(path.resolve(this.dirPath || __dirname, 'public')));
        this.app.use('/uploads', express.static(Config_1.getConfig().uploadDir));
    }
    setSubscription() {
        this.subscriptionManager = new Query.SubscriptionManager();
        this.subscriptionManager.init();
    }
    logErrors(error, req, res, next) {
        if (error.status)
            res.status(error.status);
        else
            res.status(501);
        console.error(error);
        res.json(parseError(error, 'expressjs'));
    }
    setRender() {
        Translation.getLanguages().forEach(language => {
            this.app.get('/' + language + '/*', (req, res, next) => Render_1.Render(req, res, next, language));
        });
        this.app.get('/*', (req, res, next) => Render_1.Render(req, res, next));
    }
    setFileUpload() {
        let storage;
        if (Config_1.getConfig().tempUploadDir) {
            storage = multer.diskStorage({
                destination: (req, file, callback) => {
                    callback(null, path.resolve(Config_1.getConfig().tempUploadDir));
                },
                filename: (req, file, callback) => {
                    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                }
            });
        }
        else {
            storage = multer.memoryStorage();
        }
        let upload = multer({
            storage,
            limits: {
                fileSize: Config_1.getConfig().maxFileSize * 1000000
            }
        }).any();
        this.app.post('/*', (req, res, next) => {
            upload(req, res, (err) => {
                if (err) {
                    res.error = err.message;
                }
                next();
            });
        });
    }
    setWebHook() {
        WebHook.webHooks.forEach(webHook => {
            this.app.post('/wh/' + webHook.path, (req, res, next) => WebHook.hook(webHook, req, res, next));
        });
    }
    setGraphQL() {
        this.app.use('/graphql', bodyParser.json(), (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let context = { files: req.files };
            if (req.body.operations) {
                req.body = JSON.parse(req.body.operations);
            }
            context.language = Translation.getLanguage();
            context.trans = (query, ...args) => Translation.trans(context.language, query, ...args);
            for (let hook of ServerHook_1.getHooksGraphQL()) {
                yield hook(req, context);
            }
            if (req.headers.language) {
                context.language = req.headers.language;
                context.trans = (query, ...args) => Translation.trans(context.language, query, ...args);
            }
            graphqlHTTP.graphqlExpress({
                schema: Query.getSchema(),
                context,
                formatError: error => parseError(error),
            })(req, res, next);
        }));
        this.app.get('/graphiql', graphqlHTTP.graphiqlExpress({ endpointURL: '/graphql' }));
        const websocketServer = http.createServer(this.app);
        let WS_PORT = Config_1.getConfig().portWS;
        if (Config_1.getConfig().seaportHost && Config_1.getConfig().seaportPort) {
            var ports = seaport.connect(Config_1.getConfig().seaportHost, Config_1.getConfig().seaportPort);
            websocketServer.listen(ports.register("ServerWS"), () => {
                console.log(`Websocket Server is connected to seaport as "ServerWS" on ${Config_1.getConfig().seaportHost}:${Config_1.getConfig().seaportPort}`);
                const subscriptionsServer = new subscriptionServer.SubscriptionServer({
                    schema: Query.getSchema(),
                    execute: graphql.execute,
                    subscribe: graphql.subscribe,
                    onConnect: (connectionParams, webSocket, connectionContext) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        for (let hook of ServerHook_1.getHooksWSonConnect()) {
                            yield hook(connectionParams, webSocket, connectionContext);
                        }
                        if (connectionParams.language)
                            connectionContext.socket.upgradeReq.headers.language = connectionParams.language;
                    }),
                    onOperation: (message, params, webSocket) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (!params.context)
                            params.context = {};
                        params.context.language = Translation.getLanguage();
                        for (let hook of ServerHook_1.getHooksWSonMessage()) {
                            yield hook(message, params, webSocket);
                        }
                        if (webSocket.upgradeReq.headers.language)
                            params.context.language = webSocket.upgradeReq.headers.language;
                        params.context.trans = (query, ...args) => Translation.trans(params.context.language, query, ...args);
                        return params;
                    }),
                    onDisconnect: (webSocket) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        for (let hook of ServerHook_1.getHooksWSonDisconnect()) {
                            yield hook(webSocket);
                        }
                    })
                }, {
                    server: websocketServer,
                });
            });
        }
        else {
            websocketServer.listen(WS_PORT, () => {
                console.log(`Websocket Server is now running on http://localhost:${WS_PORT}`);
                const subscriptionsServer = new subscriptionServer.SubscriptionServer({
                    schema: Query.getSchema(),
                    execute: graphql.execute,
                    subscribe: graphql.subscribe,
                    onConnect: (connectionParams, webSocket, connectionContext) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        for (let hook of ServerHook_1.getHooksWSonConnect()) {
                            yield hook(connectionParams, webSocket, connectionContext);
                        }
                        if (connectionParams.language)
                            connectionContext.socket.upgradeReq.headers.language = connectionParams.language;
                    }),
                    onOperation: (message, params, webSocket) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (!params.context)
                            params.context = {};
                        params.context.language = Translation.getLanguage();
                        for (let hook of ServerHook_1.getHooksWSonMessage()) {
                            yield hook(message, params, webSocket);
                        }
                        if (webSocket.upgradeReq.headers.language)
                            params.context.language = webSocket.upgradeReq.headers.language;
                        params.context.trans = (query, ...args) => Translation.trans(params.context.language, query, ...args);
                        return params;
                    }),
                    onDisconnect: (webSocket) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        for (let hook of ServerHook_1.getHooksWSonDisconnect()) {
                            yield hook(webSocket);
                        }
                    })
                }, {
                    server: websocketServer,
                });
            });
        }
    }
    run() {
        this.server = http.createServer(this.app);
        if (Config_1.getConfig().seaportHost && Config_1.getConfig().seaportPort) {
            console.log(`Express server connected to seaport as "Server" on ${Config_1.getConfig().seaportHost}:${Config_1.getConfig().seaportPort}`);
            var ports = seaport.connect(Config_1.getConfig().seaportHost, Config_1.getConfig().seaportPort);
            this.server.listen(ports.register("Server"));
        }
        else {
            this.server.listen(this.app.get('port'), () => {
                console.log('Express server listening on port ' + this.app.get('port'));
                if (process.env.NODE_ENV == 'development')
                    fetch('http://localhost:3001/__browser_sync__?method=reload&args=index.js');
            });
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map