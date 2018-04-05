import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as graphqlHTTP from 'apollo-server-express';
import * as graphql from 'graphql';
import * as subscriptionServer from 'subscriptions-transport-ws';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as compression from 'compression';
import * as seaport from 'seaport';
// import ddos = require('ddos');
// import ddos from 'ddos';

// Config
import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as ORM from '../Modules/ORM';
import * as Query from '../Modules/Query';
import * as Log from '../Modules/Log';
import * as WebHook from '../Modules/WebHook';
import { getHooksGraphQL, getHooksWSonConnect, getHooksWSonMessage, getHooksWSonDisconnect } from '../Modules/ServerHook';
import { Render } from '../Server/Render';

// Catch errors
export function parseError(error, type = 'graphql') {
  Log.logError(error, type);

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

export class Server {
  public app: express.Express;
  public server: http.Server;

  private api: express.Express;
  private webpackHotMiddleware: any;

  private subscriptionManager: Query.SubscriptionManager

  public async start() {
    this.config();
    this.setFileUpload();
    this.setGraphQL();
    this.setWebHook();
    this.setRender();
    this.setSubscription();
    this.run();
  }

  public config() {
    this.app = express();
    getConfig().port && this.app.set('port', getConfig().port);
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
      if (fs.existsSync(path.resolve(getConfig().publicDir, req.url.replace(/^((http|https):\/\/[\w\.:]+\/)|^(\/)/, '')) + '.gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Type', 'text/javascript');
        res.set('Content-Encoding', 'gzip');
      }
      next();
    });
    this.app.get('*.css', (req, res, next) => {
      if (fs.existsSync(path.resolve(getConfig().publicDir, req.url.replace(/^((http|https):\/\/[\w\.:]+\/)|^(\/)/, '')) + '.gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Type', 'text/css');
        res.set('Content-Encoding', 'gzip');
      }
      next();
    });
    this.app.use(this.logErrors);

    this.app.use(express.static(getConfig().publicDir));
    this.app.use('/uploads', express.static(getConfig().uploadDir));
  }

  public setSubscription() {
    this.subscriptionManager = new Query.SubscriptionManager();
    this.subscriptionManager.init();
  }

  private logErrors(error, req, res, next) {
    if (error.status) res.status(error.status);
    else res.status(501);
    console.error(error);
    res.json(parseError(error, 'expressjs'));
  }

  public setRender() {
    Translation.getLanguages().forEach(language => {
      this.app.get('/' + language + '/*', (req, res, next) => Render(req, res, next, language));
    });

    this.app.get('/*', (req, res, next) => Render(req, res, next));
  }

  public setFileUpload() {
    let storage;
    if (getConfig().tempUploadDir) {
      storage = multer.diskStorage({
        destination: (req, file, callback) => {
          callback(null, path.resolve(getConfig().tempUploadDir))
        },
        filename: (req, file, callback) => {
          callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
      })
    }
    else {
      storage = multer.memoryStorage();
    }

    let upload = multer({
      storage,
      limits: {
        fileSize: getConfig().maxFileSize * 1000000
      }
    }).any();

    this.app.post('/*', (req, res, next) => {
      upload(req, res, (err) => {
        if (err) {
          (res as any).error = err.message;
        }
        next();
      });
    });
  }

  public setWebHook() {
    WebHook.webHooks.forEach(webHook => {
      this.app.post('/wh/' + webHook.path, (req, res, next) => WebHook.hook(webHook, req, res, next));
    })
  }

  public setGraphQL() {
    this.app.use('/graphql', bodyParser.json(), async (req, res, next) => {
      let context: any = { files: req.files };

      if (req.body.operations) {
        req.body = JSON.parse(req.body.operations);
      }

      context.language = Translation.getLanguage();
      context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);

      for (let hook of getHooksGraphQL()) {
        await hook(req, context);
      }

      if (req.headers.language) {
        context.language = req.headers.language;
        context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);
      }

      graphqlHTTP.graphqlExpress({
        schema: Query.getSchema(),
        context,
        formatError: error => parseError(error),
      })(req, res, next);
    });
    this.app.get('/graphiql', graphqlHTTP.graphiqlExpress({ endpointURL: '/graphql' }));

    const websocketServer = http.createServer(this.app);

    let WS_PORT = getConfig().portWS;

    if (getConfig().seaportHost && getConfig().seaportPort) {
      var ports = (seaport as any).connect(getConfig().seaportHost, getConfig().seaportPort);
      websocketServer.listen(ports.register("ServerWS"), () => {
        Log.logInfo(`Websocket Server is connected to seaport as "ServerWS" on ${getConfig().seaportHost}:${getConfig().seaportPort}`);

        const subscriptionsServer = new subscriptionServer.SubscriptionServer({
            schema: Query.getSchema(),
            execute: graphql.execute,
            subscribe: (graphql as any).subscribe,
            onConnect: async (connectionParams, webSocket, connectionContext) => {
              for (let hook of getHooksWSonConnect()) {
                await hook(connectionParams, webSocket, connectionContext);
              }

              if (connectionParams.language) connectionContext.socket.upgradeReq.headers.language = connectionParams.language;
            },
            onOperation: async (message, params, webSocket) => {
              if (!params.context) params.context = {};

              params.context.language = Translation.getLanguage();

              for (let hook of getHooksWSonMessage()) {
                await hook(message, params, webSocket);
              }

              if (webSocket.upgradeReq.headers.language) params.context.language = webSocket.upgradeReq.headers.language;

              params.context.trans = (query: string, ...args): string => Translation.trans(params.context.language, query, ...args);

              return params;
            },
            onDisconnect: async (webSocket) => {
              for (let hook of getHooksWSonDisconnect()) {
                await hook(webSocket);
              }
            }
          },
          {
            server: websocketServer,
          }
        );
      });
    } else {
      websocketServer.listen(WS_PORT, () => {
        Log.logInfo(`Websocket Server is now running on http://localhost:${WS_PORT}`);

        const subscriptionsServer = new subscriptionServer.SubscriptionServer({
            schema: Query.getSchema(),
            execute: graphql.execute,
            subscribe: (graphql as any).subscribe,
            onConnect: async (connectionParams, webSocket, connectionContext) => {
              for (let hook of getHooksWSonConnect()) {
                await hook(connectionParams, webSocket, connectionContext);
              }

              if (connectionParams.language) connectionContext.socket.upgradeReq.headers.language = connectionParams.language;
            },
            onOperation: async (message, params, webSocket) => {
              if (!params.context) params.context = {};

              params.context.language = Translation.getLanguage();

              for (let hook of getHooksWSonMessage()) {
                await hook(message, params, webSocket);
              }

              if (webSocket.upgradeReq.headers.language) params.context.language = webSocket.upgradeReq.headers.language;

              params.context.trans = (query: string, ...args): string => Translation.trans(params.context.language, query, ...args);

              return params;
            },
            onDisconnect: async (webSocket) => {
              for (let hook of getHooksWSonDisconnect()) {
                await hook(webSocket);
              }
            }
          },
          {
            server: websocketServer,
          }
        );
      });
    }
  }

  public run() {
    this.server = http.createServer(this.app);

    if (getConfig().seaportHost && getConfig().seaportPort) {
      Log.logInfo(`Express server connected to seaport as "Server" on ${getConfig().seaportHost}:${getConfig().seaportPort}`);
      var ports = (seaport as any).connect(getConfig().seaportHost, getConfig().seaportPort);
      this.server.listen(ports.register("Server"));
    } else {
      this.server.listen(this.app.get('port'), () => {
        Log.logInfo('Express server listening on port ' + this.app.get('port'));
        if (process.env.NODE_ENV == 'development') fetch('http://localhost:3001/__browser_sync__?method=reload&args=index.js');
      });
    }
  }
}