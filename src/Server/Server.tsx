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
const ddos = require('ddos');

import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as Query from '../Modules/Query';
import * as Log from '../Modules/Log';
import * as WebHook from '../Modules/WebHook';
import * as Hooks from '../Modules/ServerHook';
import { Render } from '../Server/Render';
import { parseAndLogError } from './Lib/Error';
import { processUrl } from './Lib/Url';
import { setLanguageContext } from './Lib/Transtalion';

export class Server {
  protected app: express.Express;
  protected server: http.Server;
  protected subscriptionManager: Query.SubscriptionManager
  protected subscriptionsServer: subscriptionServer.SubscriptionServer

  public start() {
    this.init();
    this.setBasic();
    this.setHelmet();
    this.setStatic();
    this.setLogger();
    this.setFileUpload();
    this.setGraphQL();
    this.setWebHook();
    this.setRender();
    this.setSubscription();
    this.setLogError();
    this.run();
  }

  protected init() {
    this.app = express();
  }

  protected setBasic() {
    getConfig().port && this.app.set('port', getConfig().port);
    this.app.use(cookieParser());
    this.app.use(bodyParser.json());
    this.app.use(compression());
  }

  protected setHelmet() {
    if (getConfig().proxyProtection) this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.disable('x-powered-by');
    if (getConfig().ddos) {
      this.app.use(new ddos(getConfig().ddos).express);
    }
  }

  protected setStatic() {
    this.app.get('*.js', (req, res, next) => {
      getConfig().apm && Log.getApm().setTransactionName('GET ' + processUrl(req.url), 'static');
      if (fs.existsSync(path.resolve(getConfig().publicDir, processUrl(req.url)) + '.gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Type', 'text/javascript');
        res.set('Content-Encoding', 'gzip');
      }
      next();
    });
    this.app.get('*.css', (req, res, next) => {
      getConfig().apm && Log.getApm().setTransactionName('GET ' + processUrl(req.url), 'static');
      if (fs.existsSync(path.resolve(getConfig().publicDir, processUrl(req.url)) + '.gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Type', 'text/css');
        res.set('Content-Encoding', 'gzip');
      }
      next();
    });
    this.app.use(express.static(getConfig().publicDir));
    this.app.use('/uploads', express.static(getConfig().uploadDir));
  }

  protected setLogger() {
    this.app.all('/*', (req, res, next) => {
      Log.logInfo({
        message: 'request',
        method: req.method,
        path: req.path,
        url: req.url,
        hostname: req.hostname,
        headers: req.headers,
        ip: req.ip,
        body: req.body
      })
      next();
    });
  }

  protected setSubscription() {
    this.subscriptionManager = new Query.SubscriptionManager();
    this.subscriptionManager.init();
  }

  protected setLogError() {
    this.app.use((error, req, res, next) => {
      if (error.status) res.status(error.status);
      else res.status(501);
      res.json(parseAndLogError(error, 'server', req, res));
    });
  }

  protected setRender() {
    Translation.getLanguages().forEach(language => {
      this.app.get('/' + language + '/*', (req, res, next) => {
        getConfig().apm && Log.getApm().setTransactionName('GET ' + processUrl(req.baseUrl), 'render');
        return Render(req, res, next, language);
      });
    });

    this.app.get('/*', (req, res, next) => {
      getConfig().apm && Log.getApm().setTransactionName('GET ' + processUrl(req.baseUrl), 'render');
      return Render(req, res, next);
    });
  }

  protected setFileUpload() {
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
      getConfig().apm && Log.getApm().setTransactionName('POST ' + processUrl(req.baseUrl), 'upload');
      upload(req, res, (err) => {
        if (err) {
          (res as any).error = err.message;
        }
        next();
      });
    });
  }

  protected setWebHook() {
    Hooks.getWebHooks().forEach(webHook => {
      this.app.post('/wh/' + webHook.path, (req, res, next) => {
        getConfig().apm && Log.getApm().setTransactionName('POST ' + processUrl(req.baseUrl), 'webhook');
        return WebHook.hook(webHook, req, res, next)
      });
    })
  }

  protected initGraphQL() {
    Query.getSchema();
    Query.getSubscriptionSchema();
  }

  protected setGraphQL() {
    this.initGraphQL();

    this.app.use('/graphql', bodyParser.json(), async (req, res, next) => {
      getConfig().apm && Log.getApm().setTransactionName(req.method + ' ' + processUrl(req.baseUrl), 'graphql');

      let context: any = {
        files: req.files,
        language: Translation.getLanguage()
      };

      if (req.body.operations) {
        req.body = JSON.parse(req.body.operations);
      }

      for (let hook of Hooks.getHooksGraphQL()) {
        await hook(req, context);
      }

      setLanguageContext(context);

      if (req.headers.language) {
        context.language = req.headers.language;
        context.trans = (query, ...args) => Translation.trans(context.language, query, ...args);
      }

      graphqlHTTP.graphqlExpress({
        schema: Query.getSchema(),
        context,
        formatError: error => parseAndLogError(error, 'graphql', req, res),
        debug: false,
      })(req, res, next);
    });

    getConfig().graphiql && this.app.get('/graphiql', graphqlHTTP.graphiqlExpress({ endpointURL: '/graphql' }));

    const websocketServer = http.createServer(this.app);

    if (getConfig().seaportHost && getConfig().seaportPort) {
      var ports = seaport.connect(getConfig().seaportHost, getConfig().seaportPort);
      websocketServer.listen(ports.register(getConfig().seaportWSName || "ServerWS"), () => {
        Log.logInfo(`Websocket Server is connected to seaport as "${getConfig().seaportWSName || "ServerWS"}" on ${getConfig().seaportHost}:${getConfig().seaportPort}`);
        this.subscriptionsServer = this.makeSubscriptionServer(websocketServer);
      });
    } else {
      websocketServer.listen(getConfig().portWS, () => {
        Log.logInfo(`Websocket Server is listening on port ${getConfig().portWS}`);
        this.subscriptionsServer = this.makeSubscriptionServer(websocketServer);
      });
    }
  }

  makeSubscriptionServer(websocketServer: http.Server): subscriptionServer.SubscriptionServer {
    return new subscriptionServer.SubscriptionServer({
      schema: Query.getSubscriptionSchema(),
      execute: graphql.execute as any,
      subscribe: graphql.subscribe,
      onConnect: async (connectionParams, webSocket, connectionContext) => {
        for (let hook of Hooks.getHooksWSonConnect()) {
          await hook(connectionParams, webSocket, connectionContext);
        }

        if (connectionParams.language) connectionContext.socket.upgradeReq.headers.language = connectionParams.language;
      },
      onOperation: async (message, params, webSocket) => {
        if (!params.context) params.context = {};

        params.context.language = Translation.getLanguage();

        for (let hook of Hooks.getHooksWSonMessage()) {
          await hook(message, params, webSocket);
        }

        if (webSocket.upgradeReq.headers.language) params.context.language = webSocket.upgradeReq.headers.language;
        setLanguageContext(params.context);

        return params;
      },
      onDisconnect: async (webSocket) => {
        for (let hook of Hooks.getHooksWSonDisconnect()) {
          await hook(webSocket);
        }
      }
    },
      {
        server: websocketServer
      }
    );
  }

  protected run() {
    this.server = http.createServer(this.app);

    if (getConfig().seaportHost && getConfig().seaportPort) {
      Log.logInfo(`Server is connected to seaport as "${getConfig().seaportName || "Server"}" on ${getConfig().seaportHost}:${getConfig().seaportPort}`);
      var ports = seaport.connect(getConfig().seaportHost, getConfig().seaportPort);
      this.server.listen(ports.register(getConfig().seaportName || "Server"));
    } else {
      this.server.listen(this.app.get('port'), () => {
        Log.logInfo('Server is listening on port ' + this.app.get('port'));
        for (let hook of Hooks.getHooksAfterServerStart()) {
          hook();
        }
        // TODO: Make an example in hooks
        // if (process.env.NODE_ENV == 'development') fetch('http://localhost:3001/__browser_sync__?method=reload&args=index.js');
      });
    }
  }
}