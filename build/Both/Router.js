"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactRouter = require("react-router");
const ApolloReact = require("react-apollo");
const graphql_tag_1 = require("graphql-tag");
const Translation = require("../Modules/Translation");
const BothHook_1 = require("../Modules/BothHook");
let Html = null;
function DeclareHtml() {
    return function (target, ...args) {
        Html = target;
    };
}
exports.DeclareHtml = DeclareHtml;
function GetHtml() {
    return Html;
}
exports.GetHtml = GetHtml;
exports.withRouter = ReactRouter.withRouter;
exports.matchPath = ReactRouter.matchPath;
exports.gql = graphql_tag_1.default;
// export type ApolloClient = ApolloReact.ApolloClient;
exports.graphql = (str, operationOptions) => ApolloReact.graphql(str, operationOptions);
let Routes = [];
exports.ConnectProps = (name, defaultData) => {
    return function (target) {
        let state = defaultData ? Object.assign({}, defaultData) : {};
        const newProps = {};
        newProps[name] = state;
        return function (props) {
            return React.createElement(target, Object.assign({}, props, newProps));
        };
    };
};
class RouteModel {
}
function Route(path, render, order = 0) {
    return function (target, ...args) {
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
    };
}
exports.Route = Route;
class Empty extends React.Component {
    render() {
        return this.props.render();
    }
}
exports.Empty = Empty;
function GetRoutes(store, language) {
    let routes = [];
    Routes = Routes.sort((a, b) => a.order > b.order ? 1 : -1);
    Routes.forEach(route => {
        let data = {
            store
        };
        BothHook_1.getHooksRouter().forEach(hook => hook(data));
        Translation.getLanguages().forEach(language => {
            routes.push(React.createElement(ReactRouter.Route, { exact: true, path: '/' + language + (route.path || '/*'), key: '/' + language + (route.path || '/*'), render: ({ match, location, history }) => {
                    if (process.env.MODE == "client")
                        Translation.setLanguage(language);
                    return route.render(Object.assign({}, data, { trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match }));
                } }));
        });
        routes.push(React.createElement(ReactRouter.Route, { exact: true, path: route.path, key: route.path, render: ({ match, location, history }) => route.render(Object.assign({}, data, { trans: (query, ...args) => Translation.trans(language, query, ...args), location, history, match })) }));
    });
    if (routes.length > 0)
        return React.createElement(ReactRouter.Switch, null, routes);
    else
        return null;
}
exports.GetRoutes = GetRoutes;
//# sourceMappingURL=Router.js.map