"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const react_router_dom_1 = require("react-router-dom");
require("velocity-animate");
const ApolloReact = require("react-apollo");
const ApolloClient = require("apollo-client");
const ReactRedux = require("react-redux");
const ApolloCache = require("apollo-cache-inmemory");
const ApolloLinkWS = require("apollo-link-ws");
const ApolloLink = require("apollo-link");
const apollo_link_batch_http_1 = require("apollo-link-batch-http");
const graphql = require("graphql");
const Responsive = require("redux-responsive");
const Upload = require("../Client/Upload");
const Translation = require("../Modules/Translation");
const Router = require("../Modules/Router");
const Reducer = require("../Modules/Reducer");
const ClientHook_1 = require("../Modules/ClientHook");
// import * as Header from '~/Header';
class Main {
    run() {
        const store = Reducer.createStore();
        const hooksRes = ClientHook_1.getHooks().map(hook => hook(store));
        const connectionParams = {
            language: Translation.getLanguage()
        };
        hooksRes.forEach(hook => {
            if (hook.connectionParams)
                Object.assign(connectionParams, hook.connectionParams);
        });
        const wsAddress = "ws://" + window.__HOST__ + ":" + window.__WSADDRESS__ + "/";
        const linkWS = new ApolloLinkWS.WebSocketLink({
            uri: wsAddress,
            options: {
                reconnect: true,
                connectionParams
            }
        });
        const linkNetwork = new apollo_link_batch_http_1.BatchHttpLink({
            uri: `/graphql`,
        });
        const linkUpload = new Upload.UploadLink({});
        const linkSplitted = ApolloLink.ApolloLink.split(operation => {
            const operationAST = graphql.getOperationAST(operation.query, operation.operationName);
            return !!operationAST && operationAST.operation === 'subscription';
        }, linkWS, linkNetwork);
        let links = [];
        links = links.concat(linkUpload);
        hooksRes.forEach(hook => {
            if (hook.linksBefore)
                links = links.concat(hook.linksBefore);
        });
        links = links.concat(linkSplitted);
        hooksRes.forEach(hook => {
            if (hook.linksAfter)
                links = links.concat(hook.linksAfter);
        });
        let link = ApolloLink.ApolloLink.from(links);
        hooksRes.forEach(hook => {
            if (hook.linksWrap)
                link = hook.linksWrap.concat(link);
        });
        const cache = new ApolloCache.InMemoryCache(window.__APOLLO_STATE__);
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
        // window.onerror = function (message, file, line, col, error) {
        //   auth.log(error);
        //   return false;
        // }
        // store.subscribe(() => {
        //   $('head title').html(store.getState().Friends.title);
        // });
        let ReactDOMMed = ReactDOM;
        let Html = Router.GetHtml();
        ReactDOMMed.hydrate(React.createElement(ApolloReact.ApolloProvider, { client: gqlClient },
            React.createElement(ReactRedux.Provider, { store: store },
                React.createElement(react_router_dom_1.BrowserRouter, null,
                    React.createElement(Html, { store: store, client: gqlClient, language: Translation.getLanguage() }, Router.GetRoutes(store, Translation.getLanguage()))))), document.getElementById("body"), () => {
            store.dispatch(Responsive.calculateResponsiveState(window));
        });
    }
}
exports.run = () => {
    const main = new Main();
    main.run();
};
//# sourceMappingURL=Client.js.map