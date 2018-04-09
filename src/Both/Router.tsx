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

export function DeclareHtml() {
  return function (target, ...args): any {
    Html = target;
  }
}

export function GetHtml(): any {
  return Html
}

export const withRouter: any = ReactRouter.withRouter;
export const matchPath: any = ReactRouter.matchPath;
export const gql = graphqltag;
export type ApolloClient = any;
// export type ApolloClient = ApolloReact.ApolloClient;
export const graphql: <TResult = any, TMutation = any, TProps = any, TChildProps = ApolloReact.ChildProps<TProps, TResult>>(path: DocumentNode, operationOptions?: {
  options?: ApolloReact.QueryOpts | ApolloReact.MutationOpts<TMutation> | ((props: TProps) => ApolloReact.QueryOpts | ApolloReact.MutationOpts<TMutation>);
  props?: (props: {
    ownProps: TProps;
    data?: ApolloReact.QueryProps & TResult;
    mutate?: ApolloReact.MutationFunc<TResult, TMutation>;
}) => any;
  skip?: boolean | ((props: any) => boolean);
  name?: string;
  withRef?: boolean;
  shouldResubscribe?: (props: TProps, nextProps: TProps) => boolean;
  alias?: string;
}) => any = (str, operationOptions) => ApolloReact.graphql(str, operationOptions);

let Routes: RouteModel[] = [];

export const ConnectProps = (name: string, defaultData: object): any => {
  return function (target) {
    let state = defaultData ? { ...defaultData } : {};
    const newProps = {};
    newProps[name] = state;
    return function(props) {
      return React.createElement(target, { ...props, ...newProps });
    }
  }
}

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

export function Route(path: string, render: (data: {
    store,
    children,
    trans,
    match,
    location,
    history
  } & any) => any, order: number = 0) {
  return function (target, ...args): any {
    // Routes.forEach(route => {
    //   if (route.order == order) {
    //     throw new Error(`The order ${order} for: ${path} is busy by: ${route.path}`);
    //   }
    // });

    let route = new RouteModel();

    route.path = path;
    route.order = order;
    route.target = target;
    route.render = render;

    Routes.push(route);
  }
}

export function GetRoutes(store, language) {
  let routes = [];
  Routes = Routes.sort((a, b) => a.order > b.order ? 1 : -1);

  Routes.forEach(route => {
    let data = {
      store
    };

    getHooksRouter().forEach(hook => hook(data));

    Translation.getLanguages().forEach(language => {
      routes.push(
        <ReactRouter.Route exact={true} path={'/' + language + (route.path || '/*')} key={'/' + language + (route.path || '/*')} render={({ match, location, history }) => {
          if (process.env.MODE == "client") Translation.setLanguage(language);
          return route.render({...data, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})
        }}/>
      );
    });

    routes.push(
      <ReactRouter.Route exact={true} path={route.path} key={route.path} render={({ match, location, history }) => route.render({...data, trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match})}/>
    )
  });

  if (routes.length > 0) return <ReactRouter.Switch>{routes}</ReactRouter.Switch>;
  else return null;
}