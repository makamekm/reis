require("fetch-everywhere");

(global as any).process = global.process || {};
global.process.env = global.process.env || {};
global.process.env.MODE = 'client';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import * as ReactRedux from 'react-redux';
import * as ApolloCache from 'apollo-cache-inmemory';
import * as ApolloLinkWS from "apollo-link-ws";
import * as ApolloLink from "apollo-link";
import { BatchHttpLink } from 'apollo-link-batch-http';
import * as graphql from 'graphql';
import * as Responsive from 'redux-responsive';

import * as Upload from '../Client/Upload';
import * as Translation from '../Modules/Translation';
import * as Router from '../Modules/Router';
import * as Reducer from '../Modules/Reducer';
import { getHooks, Hook } from '../Modules/ClientHook';

// TODO: Optimize client links creation
function genLink(hooksRes: Hook[], context): ApolloLink.ApolloLink {
  const wsAddress = "ws://" + (window as any).__HOST__ + ":" + (window as any).__WSADDRESS__ + "/";
  const linkWS = new ApolloLinkWS.WebSocketLink({
    uri: wsAddress,
    options: {
      reconnect: true,
      connectionParams: context
    }
  });

  const linkNetwork = new BatchHttpLink({
    uri: `/graphql`,
  });

  const linkUpload = new Upload.UploadLink({});

  const linkSplitted = ApolloLink.ApolloLink.split(
    operation => {
      const operationAST = graphql.getOperationAST(operation.query as any, operation.operationName);
      return !!operationAST && operationAST.operation === 'subscription';
    },
    linkWS,
    linkNetwork
  );

  let links: ApolloLink.ApolloLink[] = [];

  links = links.concat(linkUpload);

  hooksRes.forEach(hook => {
    if (hook.linksBefore) links = links.concat(hook.linksBefore);
  });

  links = links.concat(linkSplitted);

  hooksRes.forEach(hook => {
    if (hook.linksAfter) links = links.concat(hook.linksAfter);
  });

  let link = ApolloLink.ApolloLink.from(links);

  hooksRes.forEach(hook => {
    if (hook.linksWrap) link = hook.linksWrap.concat(link);
  });

  return link;
}

export function run(callback?: () => void) {
  const context = {
    language: Translation.getLanguage()
  };
  const store = Reducer.createStore();
  const hooksRes = getHooks().map(hook => hook(store, context));
  const link = genLink(hooksRes, context);
  const cache = new ApolloCache.InMemoryCache((window as any).__APOLLO_STATE__);
  const gqlClient = new ApolloClient.ApolloClient({
    link,
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

  // TODO: Log errors in client
  // window.onerror = function (message, file, line, col, error) {
  //   auth.log(error);
  //   return false;
  // }

  let Html = Router.GetHtml();

  ReactDOM.hydrate(
    <ApolloReact.ApolloProvider client={gqlClient as any}>
      <ReactRedux.Provider store={store}>
        <BrowserRouter>
          <Html client={gqlClient} store={store} language={Translation.getLanguage()}>
            {Router.GetRoutes(store, Translation.getLanguage())}
          </Html>
        </BrowserRouter>
      </ReactRedux.Provider>
    </ApolloReact.ApolloProvider>, document.getElementById("body"), () => {
      store.dispatch((Responsive as any).calculateResponsiveState(window));
      if (callback) callback();
    }
  );
}