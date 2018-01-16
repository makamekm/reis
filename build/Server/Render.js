"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const react_router_1 = require("react-router");
const ApolloReact = require("react-apollo");
const ApolloClient = require("apollo-client");
const ReactRedux = require("react-redux");
const ApolloCache = require("apollo-cache-inmemory");
const Helmet = require("react-helmet");
const apollo_link_batch_http_1 = require("apollo-link-batch-http");
const ApolloLink = require("apollo-link");
const Config_1 = require("../Modules/Config");
const Translation = require("../Modules/Translation");
const Router = require("../Modules/Router");
const Reducer = require("../Modules/Reducer");
const ServerHook_1 = require("../Modules/ServerHook");
const Log = require("../Modules/Log");
exports.Render = (req, res, next, _language) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const store = Reducer.createStore();
    let language = _language;
    const hooksRes = [];
    for (let hook of ServerHook_1.getHooksRender()) {
        let hookR = yield hook(req, res, next, language, store);
        if (!hookR)
            return;
        if (!language && hookR.language) {
            language = hookR.language;
        }
        hooksRes.push(hookR);
    }
    if (!language) {
        language = Translation.getLanguage();
    }
    const linkNetwork = new apollo_link_batch_http_1.BatchHttpLink({
        uri: `http://${Config_1.getConfig().host}:${Config_1.getConfig().globalPort}/graphql`,
    });
    // const linkError = onError(({ graphQLErrors, networkError, operation }) => {
    //   if (graphQLErrors) {
    //     graphQLErrors.map(({ message, locations, path }) => {
    //       console.error(
    //         `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
    //       );
    //       store.dispatch(Header.setNotification({
    //         id: 'GraphQLError',
    //         title: operation.operationName ? `Server has sended an error: ${operation.operationName}` : `Server has sended an error`,
    //         message: `Message: ${message}`,
    //         type: 'error'
    //       }));
    //     });
    //   }
    //   if (networkError) {
    //     console.error(`[Network error]: ${networkError}`);
    //     store.dispatch(Header.setNotification({
    //       id: 'NetworkError',
    //       title: operation.operationName ? `Network error: ${operation.operationName}` : `Network error`,
    //       message: networkError.message,
    //       type: 'error'
    //     }));
    //   }
    // });
    let links = [];
    hooksRes.forEach(hook => {
        links = links.concat(hook.linksBefore);
    });
    links = links.concat(linkNetwork);
    hooksRes.forEach(hook => {
        links = links.concat(hook.linksAfter);
    });
    // const link = linkError.concat(ApolloLink.ApolloLink.from(links));
    const link = ApolloLink.ApolloLink.from(links);
    let cache = new ApolloCache.InMemoryCache();
    const gqlClient = new ApolloClient.ApolloClient({
        link, cache, queryDeduplication: true, defaultOptions: {
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
    let Html = Router.GetHtml();
    let component = (React.createElement(ApolloReact.ApolloProvider, { client: gqlClient },
        React.createElement(ReactRedux.Provider, { store: store },
            React.createElement(react_router_1.StaticRouter, { location: req.url, context: {} },
                React.createElement(Html, { client: gqlClient, store: store, language: language }, Router.GetRoutes(store, language))))));
    try {
        let data = yield ApolloReact.getDataFromTree(component);
    }
    catch (e) {
        Log.fixError(e, 'serverRender');
    }
    let html = ReactDOMServer.renderToString(component);
    const helmet = Helmet.Helmet.renderStatic();
    res.status(200);
    res.send(`
    <!doctype html>
    <html ${helmet.htmlAttributes.toString()}>
        <head>
          <meta charset="utf-8"/>
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
          <script type="application/javascript">
            window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())};
            window.__TRANSLATION__ = ${JSON.stringify(Translation.getTranslation())};
            window.__LANGUAGES__ = ${JSON.stringify(Translation.getLanguages())};
            window.__LANGUAGE__ = "${language}";
            window.__HOST__ = "${Config_1.getConfig().host}";
            window.__WSADDRESS__ = ${Config_1.getConfig().globalPortWS};
            window.__APOLLO_STATE__ = ${JSON.stringify(cache.extract())};
          </script>
        </head>
        <body ${helmet.bodyAttributes.toString()}>
          <div style="min-height: 100vh; display: flex; flex-flow: column" id="body">${html}</div>
          <script src="/index.js"></script>
        </body>
    </html>
  `);
});
//# sourceMappingURL=Render.js.map