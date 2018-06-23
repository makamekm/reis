import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import * as ReactRouterDom from 'react-router-dom';
import * as ApolloReact from 'react-apollo';
import * as ApolloClient from 'apollo-client';
import { DocumentNode } from 'graphql';
import graphqltag from 'graphql-tag';

import * as Translation from '../Modules/Translation';
import { getHooksRouter } from '../Modules/BothHook';

let Html = null
export function GetHtml(): any {
  return Html
}
export function DeclareHtml() {
  return function (target, ...args): any {
    Html = target;
  }
}

export const withRouter: any = ReactRouter.withRouter;
export const matchPath: any = ReactRouter.matchPath;
export const gql = graphqltag;
export type ApolloClient = any;
// TODO: Create an issue ticket
// export type ApolloClient = ApolloReact.ApolloClient;
export const graphql = ApolloReact.graphql;

let Routes: RouteModel[] = [];

// TODO: Remove if is not necessary
// export const connectProps = (name: string, defaultData: object, target): any => {
//   let state = defaultData ? { ...defaultData } : {};
//   const newProps = {};
//   newProps[name] = state;
//   return function(props) {
//     return React.createElement(target, { ...props, ...newProps });
//   }
// }

// export const ConnectProps = (name: string, defaultData: object): any => {
//   return function (target) {
//     return connectProps(name, defaultData, target);
//   }
// }

class RouteModel {
  order: number
  path: string
  target: any
  render: (data: {
    store,
    trans,
    match,
    location,
    history
  } & any) => any
}

export function cleanRoutes() {
  Routes = [];
}

export function route(path: string, render: (data: {
    store,
    children,
    trans,
    match,
    location,
    history
} & any) => any, order: number = 0) {
  let route = new RouteModel();

  route.path = path;
  route.order = order;
  route.render = render;

  Routes.push(route);
}

export function Route(path: string, render: (data: {
    store,
    children,
    trans,
    match,
    location,
    history
  } & any) => any, order: number = 0) {
  return function (target, ...args): any {
    route(path, render, order);
    return target;
  }
}

export function GetRoutes(stores, language: string) {
  let routes = [];
  Routes = Routes.sort((a, b) => a.order > b.order ? 1 : -1);

  Routes.forEach(route => {
    let context = {
      stores
    };

    getHooksRouter().forEach(hook => hook(context));

    Translation.getLanguages().forEach(language => {
      routes.push(
        <ReactRouter.Route exact={true} path={'/' + language + (route.path || '/*')} key={'/' + language + (route.path || '/*')} render={({ match, location, history }) => {
          if (process.env.MODE == "client") Translation.setLanguage(language);
          return route.render({...context, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})
        }}/>
      );
    });

    routes.push(
      <ReactRouter.Route exact={true} path={route.path} key={route.path} render={({ match, location, history }) => route.render({...context, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})}/>
    )
  });

  if (routes.length > 0) return <ReactRouter.Switch>{routes}</ReactRouter.Switch>;
  else return null;
}