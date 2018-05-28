import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import { responsiveStateReducer, responsiveStoreEnhancer, createResponsiveStoreEnhancer } from 'redux-responsive';

let initialState: any = {};
if (process.env.MODE == "client" && (window as any).__INITIAL_STATE__) {
  initialState = (window as any).__INITIAL_STATE__;
}

export const Provider = ReactRedux.Provider;

const reducers: { [name: string]: any } = {};
export function Reducer(name: string, func) {
  reducers[name] = func;
}

export function connect<TStateProps = any, TDispatchProps = any, State = any, TOwnProps = any, TMergedProps = any>(
  mapStateToProps: ReactRedux.MapStateToPropsParam<TStateProps, TOwnProps, State>,
  mapDispatchToProps: ReactRedux.MapDispatchToPropsParam<TDispatchProps, TOwnProps> = (props): any => ({}),
  mergeProps: ReactRedux.MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps> = null,
  options: ReactRedux.Options<State, TStateProps, TOwnProps, TMergedProps> = {},
  target
): ReturnType<ReturnType<typeof ReactRedux.connect>> {
  return ReactRedux.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target);
}

export function Connect<TStateProps = any, TDispatchProps = any, State = any, TOwnProps = any, TMergedProps = any>(
  mapStateToProps: ReactRedux.MapStateToPropsParam<TStateProps, TOwnProps, State>,
  mapDispatchToProps: ReactRedux.MapDispatchToPropsParam<TDispatchProps, TOwnProps> = (props): any => ({}),
  mergeProps: ReactRedux.MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps> = null,
  options: ReactRedux.Options<State, TStateProps, TOwnProps, TMergedProps> = {}
): any {
  return function (target): ReturnType<ReturnType<typeof ReactRedux.connect>> {
    return connect(mapStateToProps, mapDispatchToProps, mergeProps, options, target);
  }
}

export function createStore<T = {[name: string]: string}>(): Redux.Store<T> {
  reducers.browser = responsiveStateReducer;

  let composed: ReturnType<typeof Redux.compose>;

  if (process.env.MODE == "client" && window && (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()) {
    composed = Redux.compose(
      createResponsiveStoreEnhancer({calculateInitialState: false}),
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    )
  } else {
    composed = Redux.compose(
      createResponsiveStoreEnhancer({calculateInitialState: false})
    )
  }

  return Redux.createStore<T, any, {}, {}>(Redux.combineReducers<any>(reducers), initialState, composed as any);
}

// TODO: Add types
export function createStoreEnc<T = {[name: string]: string}>(enc: Redux.StoreEnhancer, initialState = {}): Redux.Store<T> {
  reducers.browser = responsiveStateReducer;

  const store: Redux.Store<T> = Redux.createStore<T, any, {}, {}>(Redux.combineReducers<any>(reducers), initialState, enc);
  return store;
}