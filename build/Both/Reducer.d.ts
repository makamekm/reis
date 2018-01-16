import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
export declare function Connect<TStateProps = any, TDispatchProps = any, TModel = any, TOwnProps = any>(mapStateToProps: (initialState: TModel, ownProps: TOwnProps) => TStateProps, mapDispatchToProps?: (dispatch: ReactRedux.Dispatch<any>, ownProps: TOwnProps) => TDispatchProps, options?: ReactRedux.Options<TStateProps, TOwnProps>): (target: any) => any;
export declare let createStore: () => Redux.Store<any>;
export declare let createStoreEnc: (enc: Redux.GenericStoreEnhancer, initialState?: any) => Redux.Store<any>;
export declare function Reducer(name: any): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => any;
export declare const Provider: typeof ReactRedux.Provider;
