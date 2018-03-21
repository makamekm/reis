import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
export declare const Connect: ReactRedux.Connect;
export declare let createStore: () => Redux.Store<any>;
export declare let createStoreEnc: (enc: Redux.GenericStoreEnhancer, initialState?: any) => Redux.Store<any>;
export declare function Reducer(name: any): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => any;
export declare const Provider: typeof ReactRedux.Provider;
