"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redux = require("redux");
const ReactRedux = require("react-redux");
const redux_responsive_1 = require("redux-responsive");
function Connect(mapStateToProps, mapDispatchToProps = (props) => ({}), options = {}) {
    return function (target) {
        return ReactRedux.connect(mapStateToProps, mapDispatchToProps, null, options)(target);
    };
}
exports.Connect = Connect;
let initialState = {};
if (process.env.MODE == "client" && window.__INITIAL_STATE__) {
    initialState = window.__INITIAL_STATE__;
}
const Reducers = {};
exports.createStore = () => {
    Reducers.browser = redux_responsive_1.responsiveStateReducer;
    let composed;
    if (process.env.MODE == "client" && window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) {
        composed = Redux.compose(redux_responsive_1.createResponsiveStoreEnhancer({ calculateInitialState: false }), window.__REDUX_DEVTOOLS_EXTENSION__());
    }
    else {
        composed = Redux.compose(redux_responsive_1.createResponsiveStoreEnhancer({ calculateInitialState: false }));
    }
    const store = Redux.createStore(Redux.combineReducers(Reducers), initialState, composed);
    return store;
};
exports.createStoreEnc = (enc, initialState = {}) => {
    Reducers.browser = redux_responsive_1.responsiveStateReducer;
    const store = Redux.createStore(Redux.combineReducers(Reducers), initialState, enc);
    return store;
};
function Reducer(name) {
    return (target, key, descriptor) => {
        Reducers[name ? name : key] = descriptor.value;
    };
}
exports.Reducer = Reducer;
exports.Provider = ReactRedux.Provider;
//# sourceMappingURL=Reducer.js.map