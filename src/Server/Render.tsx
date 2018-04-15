import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import * as ReactRedux from 'react-redux';
import * as ApolloCache from 'apollo-cache-inmemory';
import * as Helmet from "react-helmet";
import { BatchHttpLink } from 'apollo-link-batch-http';
import * as ApolloLink from "apollo-link";
import { onError } from "apollo-link-error";

import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as Router from '../Modules/Router';
import * as Reducer from '../Modules/Reducer';
import { getHooksRender } from '../Modules/ServerHook';
import * as Log from '../Modules/Log';

export const Render = async (req, res, next, _language?) => {
  const store = Reducer.createStore();
  let language = _language;

  const hooksRes = [];

  for (let hook of getHooksRender()) {
    let hookR = await hook(req, res, next, language, store);

    if (!hookR) return;

    if (!language && hookR.language) {
      language = hookR.language
    }

    hooksRes.push(hookR);
  }

  if (!language) {
    language = Translation.getLanguage();
  }

  const linkNetwork = new BatchHttpLink({
    uri: `http://${getConfig().host}:${getConfig().globalPort}/graphql`,
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

  let links: ApolloLink.ApolloLink[] = [];

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

  let component = (
    <ApolloReact.ApolloProvider client={gqlClient as any}>
      <ReactRedux.Provider store={store}>
        <StaticRouter location={req.url} context={{}}>
          <Html client={gqlClient} store={store} language={language}>
            {Router.GetRoutes(store, language)}
          </Html>
        </StaticRouter>
      </ReactRedux.Provider>
    </ApolloReact.ApolloProvider>
  );

  try {
    let data = await ApolloReact.getDataFromTree(component);
  }
  catch (e) {
    Log.logError(e, { type: "server_render" });
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
            window.__HOST__ = "${getConfig().host}";
            window.__WSADDRESS__ = ${getConfig().globalPortWS};
            window.__APOLLO_STATE__ = ${JSON.stringify(cache.extract())};
          </script>
        </head>
        <body ${helmet.bodyAttributes.toString()}>
          <div style="min-height: 100vh; display: flex; flex-flow: column" id="body">${html}</div>
          <script src="/index.js"></script>
        </body>
    </html>
  `);
}