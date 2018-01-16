import * as React from 'react';
import * as ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import 'velocity-animate';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import * as ReactRedux from 'react-redux';
import * as ApolloCache from 'apollo-cache-inmemory';
import * as ApolloLinkWS from "apollo-link-ws";
import * as ApolloLink from "apollo-link";
import { onError } from "apollo-link-error";
import * as graphql from 'graphql';
import * as Responsive from 'redux-responsive';

import * as Upload from '../Client/Upload';
import * as Translation from '../Modules/Translation';
import * as Router from '../Modules/Router';
import * as Reducer from '../Modules/Reducer';
import { getHooks } from '../Modules/ClientHook';

// import * as Header from '~/Header';

class Main {

  public run() {
    const store = Reducer.createStore();

    const hooksRes = getHooks().map(hook => hook(store));

    const connectionParams = {
      language: Translation.getLanguage()
    };

    hooksRes.forEach(hook => {
      if (hook.connectionParams) Object.assign(connectionParams, hook.connectionParams)
    });

    const wsAddress = "ws://" + (window as any).__HOST__ + ":" + (window as any).__WSADDRESS__ + "/";

    const linkWS = new ApolloLinkWS.WebSocketLink({
      uri: wsAddress,
      options: {
        reconnect: true,
        connectionParams
      }
    });

    const linkNetwork = Upload.createLinkNetwork({
      uri: '/graphql',
    });

    const linkSplitted = ApolloLink.ApolloLink.split(
      operation => {
        const operationAST = graphql.getOperationAST(operation.query, operation.operationName);
        return !!operationAST && operationAST.operation === 'subscription';
      },
      linkWS,
      linkNetwork
    );

    let links: ApolloLink.ApolloLink[] = [];

    hooksRes.forEach(hook => {
      if (hook.linksBefore) links = links.concat(hook.linksBefore);
    });

    links = links.concat(linkSplitted);

    hooksRes.forEach(hook => {
      if (hook.linksAfter) links = links.concat(hook.linksAfter);
    });

    let link: ApolloLink.ApolloLink = ApolloLink.ApolloLink.from(links);

    hooksRes.forEach(hook => {
      if (hook.linksWrap) link = hook.linksWrap.concat(link);
    });

    const cache = new ApolloCache.InMemoryCache((window as any).__APOLLO_STATE__);

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

    let ReactDOMMed: any = ReactDOM;

    let Html = Router.GetHtml();

    ReactDOMMed.hydrate(
      <ApolloReact.ApolloProvider client={gqlClient as any}>
        <ReactRedux.Provider store={store}>
          <BrowserRouter>
            <Html store={store} client={gqlClient} language={Translation.getLanguage()}>
              {Router.GetRoutes(store, Translation.getLanguage())}
            </Html>
          </BrowserRouter>
        </ReactRedux.Provider>
      </ApolloReact.ApolloProvider>, document.getElementById("body"), () => {
        store.dispatch((Responsive as any).calculateResponsiveState(window));
      }
    );
  }
}

export const run = () => {
  const main = new Main();
  main.run();
}