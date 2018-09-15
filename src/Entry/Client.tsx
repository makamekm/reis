require("fetch-everywhere");

(global as any).process = global.process || {};
global.process.env = global.process.env || {};
global.process.env.MODE = 'client';

declare var window: {
  __INITIAL_STATE__: Object
};

let initialStates: any = {};
if (window.__INITIAL_STATE__) {
  initialStates = window.__INITIAL_STATE__;
}

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import { Provider } from 'mobx-react';
import * as ApolloCache from 'apollo-cache-inmemory';

import * as Translation from '../Modules/Translation';
import * as Router from '../Modules/Router';
import * as Model from '../Modules/Model';
import { getHooks } from '../Modules/ClientHook';

import { genLink } from '../Client/Link';

export async function run(callback?: () => void) {
  const context = {
    language: Translation.getLanguage()
  };
  const stores = await Model.getStores(initialStates);
  const hooksRes = getHooks().map(hook => hook(stores, context));
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
      <Provider {...stores}>
        <BrowserRouter>
          <Html client={gqlClient} language={Translation.getLanguage()}>
            {Router.GetRoutes(stores, Translation.getLanguage())}
          </Html>
        </BrowserRouter>
      </Provider>
    </ApolloReact.ApolloProvider>, document.getElementById("body"), () => {
      if (callback) callback();
    }
  );
}