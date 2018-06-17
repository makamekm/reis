import * as React from 'react';
import * as Redux from 'redux';
import * as ReactDOM from 'react-dom';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import * as ReactRedux from 'react-redux';
import * as ApolloCache from 'apollo-cache-inmemory';
import { Helmet } from "react-helmet";
import { BatchHttpLink } from 'apollo-link-batch-http';
import * as ApolloLink from "apollo-link";
import { onError } from "apollo-link-error";
import * as express from 'express';

import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as Router from '../Modules/Router';
import * as Reducer from '../Modules/Reducer';
import { getHooksRender, Hook } from '../Modules/ServerHook';
import * as Log from '../Modules/Log';
import { setLanguageContext } from './Lib/Translation';

export async function checkInteruptHook(req: express.Request, res: express.Response, next: express.NextFunction, store: Redux.Store<any>, context, hooksRes: Hook[]): Promise<boolean> {
  for (let hook of getHooksRender()) {
    let hookRes = await hook(req, res, next, context, store);

    if (!hookRes) return false;

    hooksRes.push(hookRes);
  }

  return true;
}

export function genLink(hooksRes: any[]): ApolloLink.ApolloLink {
  const linkNetwork = new BatchHttpLink({
    uri: `http://${getConfig().host}:${getConfig().globalPort}/graphql`,
  });

  let links: ApolloLink.ApolloLink[] = [];

  hooksRes.forEach(hook => {
    if (hook.linksBefore) links = links.concat(hook.linksBefore);
  });

  links = links.concat(linkNetwork);

  hooksRes.forEach(hook => {
    if (hook.linksAfter) links = links.concat(hook.linksAfter);
  });

  // TODO: Error processing

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

  // const link = linkError.concat(ApolloLink.ApolloLink.from(links));

  let link = ApolloLink.ApolloLink.from(links);

  hooksRes.forEach(hook => {
    if (hook.linksWrap) link = hook.linksWrap.concat(link);
  });

  return link;
}

export async function Render(req: express.Request, res: express.Response, next: express.NextFunction, language?: string) {
  const context = {
    language: language || Translation.getLanguage()
  };

  const store = Reducer.createStore();

  const hooksRes: Hook[] = [];

  if (!await checkInteruptHook(req, res, next, store, context, hooksRes)) return;

  setLanguageContext(context);

  const link = genLink(hooksRes);

  const cache = new ApolloCache.InMemoryCache();

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

  const Html = Router.GetHtml();

  const component = (
    <ApolloReact.ApolloProvider client={gqlClient}>
      <ReactRedux.Provider store={store}>
        <StaticRouter location={req.url} context={{}}>
          <Html client={gqlClient} store={store} language={context.language}>
            {Router.GetRoutes(store, context.language)}
          </Html>
        </StaticRouter>
      </ReactRedux.Provider>
    </ApolloReact.ApolloProvider>
  );

  // TODO: Fix server rendering with context (Fixed & need to test)
  let html: string;

  try {
    html = await ApolloReact.renderToStringWithData(component);
    // await ApolloReact.getDataFromTree(component);
  }
  catch (e) {
    Log.logError(e, { type: "server_render" });
    html = ReactDOMServer.renderToString(component);
  }

  // html = ReactDOMServer.renderToString(component);

  const helmet = Helmet.renderStatic();

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
            window.__LANGUAGE__ = "${context.language}";
            window.__CONTEXT__ = ${JSON.stringify(context)};
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