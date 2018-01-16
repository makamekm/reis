/// <reference types="react" />
import * as React from 'react';
import * as ApolloReact from 'react-apollo';
import { DocumentNode } from 'graphql';
import graphqltag from 'graphql-tag';
export declare function DeclareHtml(): (target: any, ...args: any[]) => any;
export declare function GetHtml(): any;
export declare const withRouter: any;
export declare const matchPath: any;
export declare const gql: typeof graphqltag;
export declare type ApolloClient = any;
export declare const graphql: <TResult = any, TMutation = any, TProps = any, TChildProps = ApolloReact.ChildProps<TProps, TResult>>(path: DocumentNode, operationOptions?: {
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
}) => any;
export declare const ConnectProps: (name: string, defaultData: object) => any;
export declare function Route(path: string, render: (data: {
    store;
    children;
    trans;
    match;
    location;
    history;
} & any) => any, order?: number): (target: any, ...args: any[]) => any;
export declare class Empty extends React.Component<{
    render: any;
}, {}> {
    render(): any;
}
export declare function GetRoutes(store: any, language: any): JSX.Element;
