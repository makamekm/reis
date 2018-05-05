import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import { responsiveStateReducer, responsiveStoreEnhancer, createResponsiveStoreEnhancer } from 'redux-responsive';

export function Connect<TStateProps = any, TDispatchProps = any, State = any, TOwnProps = any, TMergedProps = any>(
  mapStateToProps: ReactRedux.MapStateToPropsParam<TStateProps, TOwnProps, State>,
  mapDispatchToProps: ReactRedux.MapDispatchToPropsParam<TDispatchProps, TOwnProps> = (props): any => ({}),
  mergeProps: ReactRedux.MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps> = null,
  options: ReactRedux.Options<State, TStateProps, TOwnProps, TMergedProps> = {}
) {
  return function (target): any {
    return ReactRedux.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target);
  }
}

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

  const store: Redux.Store<any> = Redux.createStore<any, any, {}, {}>(Redux.combineReducers<any>(Reducers), initialState, composed);

  return store;
}

export let createStoreEnc: (enc: Redux.StoreEnhancer, initialState?: any) => Redux.Store<any> = (enc: Redux.StoreEnhancer, initialState: any = {}) => {
  Reducers.browser = responsiveStateReducer;

  const store: Redux.Store<any> = Redux.createStore<any, any, {}, {}>(Redux.combineReducers<any>(Reducers), initialState, enc);
  return store;
}

export function Reducer(name: string, func) {
  Reducers[name] = func;
}

export const Provider = ReactRedux.Provider;