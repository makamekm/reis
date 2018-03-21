import * as React from 'react';
import * as ReactDOM from "react-dom";
import * as Redux from 'redux';
import * as PromiseMiddleware from 'redux-promise';
import * as ReactRedux from 'react-redux';
import { responsiveStateReducer, responsiveStoreEnhancer, createResponsiveStoreEnhancer } from 'redux-responsive';
import * as ApolloClient from "apollo-client";

export const Connect = ReactRedux.connect;

let initialState: any = {};

if (process.env.MODE == "client" && (window as any).__INITIAL_STATE__) {
  initialState = (window as any).__INITIAL_STATE__;
}

const Reducers: { [name: string]: any } = {};

export let createStore: () => Redux.Store<any> = () => {
  Reducers.browser = responsiveStateReducer;

  let composed: any;

  if (process.env.MODE == "client" && window && (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()) {
    composed = Redux.compose(
      createResponsiveStoreEnhancer({calculateInitialState: false}),
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    )
  }
  else {
    composed = Redux.compose(
      createResponsiveStoreEnhancer({calculateInitialState: false})
    )
  }

  const store: Redux.Store<any> = Redux.createStore<any>(Redux.combineReducers<any>(Reducers), initialState, composed);

  return store;
}

export let createStoreEnc: (enc: Redux.GenericStoreEnhancer, initialState?: any) => Redux.Store<any> = (enc: Redux.GenericStoreEnhancer, initialState: any = {}) => {
  Reducers.browser = responsiveStateReducer;

  const store: Redux.Store<any> = Redux.createStore<any>(Redux.combineReducers<any>(Reducers), initialState, enc);
  return store;
}

export function Reducer(name) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>): any => {
    Reducers[name ? name : key] = descriptor.value;
  }
}

export const Provider = ReactRedux.Provider;