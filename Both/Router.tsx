import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactRouter from 'react-router';
import * as ReactRouterDom from 'react-router-dom';
import * as ApolloReact from 'react-apollo';
import graphqltag from 'graphql-tag';
export { ApolloClient } from 'apollo-client';

import * as Translation from '../Modules/Translation';
import { getHooksRouter, getBeforeRenderRouter } from '../Modules/BothHook';

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
// TODO: Create an issue ticket
// export type ApolloClient = ApolloReact.ApolloClient;
export type RA = <TProps extends TGraphQLVariables | {} = {}, TData = any, TGraphQLVariables = any, TChildProps = Partial<ApolloReact.DataProps<TData, TGraphQLVariables>> & Partial<ApolloReact.MutateProps<TData, TGraphQLVariables>>>(document: any, operationOptions?: ApolloReact.OperationOption<TProps, TData, TGraphQLVariables, TChildProps>) => any;
export const graphql: RA = ApolloReact.graphql;
export const Query = ApolloReact.Query;
export const Mutation = ApolloReact.Mutation;

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
        <ReactRouter.Route exact path={'/' + language + (route.path || '/*')} key={'/' + language + (route.path || '/*')} render={({ match, location, history }) => {
          // if (process.env.MODE == "client") Translation.setLanguage(language);
          getBeforeRenderRouter().forEach(hook => hook(match, location, history));
          return route.render({...context, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})
        }}/>
      );
    });

    routes.push(
      <ReactRouter.Route exact path={route.path} key={route.path} render={({ match, location, history }) => route.render({...context, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})}/>
    )
  });

  if (routes.length > 0) return <ReactRouter.Switch>{routes}</ReactRouter.Switch>;
  else return null;
}