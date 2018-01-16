"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const Subscriptions = require("graphql-subscriptions");
const RedisNRP = require("node-redis-pubsub");
const Config_1 = require("../Modules/Config");
exports.pubsub = new Subscriptions.PubSub();
const publishes = {};
const nrp = new RedisNRP({
    port: Config_1.getConfig().redis['Main'].port,
    host: Config_1.getConfig().redis['Main'].host,
    auth: Config_1.getConfig().redis['Main'].password,
    scope: 'cb_subscription'
});
class SubscriptionManager {
    constructor(name = 'Main') {
        this.name = name;
        this.publishes = publishes[name];
    }
    init() {
        if (this.publishes)
            for (let name of this.publishes) {
                nrp.on(name, function (data) {
                    exports.pubsub.publish(name, data);
                });
            }
    }
}
exports.SubscriptionManager = SubscriptionManager;
function Publish(name, data, scope = 'Main') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        nrp.emit(name, data);
    });
}
exports.Publish = Publish;
function Subscribe(name, basic, filter) {
    if (filter) {
        return Subscriptions.withFilter(() => {
            if (basic)
                basic();
            return exports.pubsub.asyncIterator(name);
        }, filter);
    }
    else {
        return basic ? Subscriptions.withFilter(() => {
            basic();
            return exports.pubsub.asyncIterator(name);
        }, () => true) : exports.pubsub.asyncIterator(name);
    }
}
exports.Subscribe = Subscribe;
// export const EnumType = GraphQLEnumType;
// export const ScalarType = GraphQLScalarType;
// export const GraphQLError = GraphQLError;
// export const Kind = Kind;
let typesInput = {};
let types = {};
function getInputModelType(model) {
    if (typesInput[model.id]) {
        return typesInput[model.id];
    }
    let fields = {};
    for (let i in model.fields) {
        let field = model.fields[i];
        fields[field.name] = {
            type: getInputType(field)
        };
    }
    typesInput[model.id] = new graphql_1.GraphQLInputObjectType({
        name: model.id,
        fields: fields
    });
    return typesInput[model.id];
}
exports.getInputModelType = getInputModelType;
function getInputTypeSimple(t, arg) {
    let type = graphql_1.GraphQLString;
    switch (typeof t) {
        case 'string':
            if (t == 'string') {
                type = graphql_1.GraphQLString;
            }
            else if (t == 'integer') {
                type = graphql_1.GraphQLInt;
            }
            else if (t == 'float') {
                type = graphql_1.GraphQLFloat;
            }
            else if (t == 'boolean') {
                type = graphql_1.GraphQLBoolean;
            }
            else if (t == 'id') {
                type = graphql_1.GraphQLID;
            }
            else {
                throw new Error('Undefined arg type: ' + t);
            }
            break;
        default:
            if (Array.isArray(t)) {
                const types = t.forEach(t => getInputTypeSimple(t, arg));
                type = graphql_1.GraphQLUnionType;
            }
            else {
                let tt = t();
                if (typeof tt == 'function') {
                    if (tt.prototype.__graphql_input) {
                        type = getInputModelType(tt.prototype.__graphql_input);
                    }
                    else {
                        console.trace(arg, t);
                        throw new Error('The arg in not an Input: ' + typeof arg.type);
                    }
                }
                else {
                    type = tt;
                }
            }
    }
    if (!arg.nullable) {
        type = new graphql_1.GraphQLNonNull(type);
    }
    if (arg.array) {
        type = new graphql_1.GraphQLList(type);
    }
    return type;
}
exports.getInputTypeSimple = getInputTypeSimple;
function getInputType(arg) {
    if (Array.isArray(arg.type)) {
        const uTypes = arg.type.map(t => ({ t, type: getInputTypeSimple(t, arg) }));
        const type = new graphql_1.GraphQLUnionType({
            name: 'Union' + arg.name,
            types: uTypes.map(t => t.type),
            resolveType: (value) => {
                const t = uTypes.find(t => t.t === arg.resolveType(value));
                return t && t.type;
            }
        });
        return type;
    }
    else {
        return getInputTypeSimple(arg.type, arg);
    }
}
exports.getInputType = getInputType;
function getFieldType(arg) {
    let type = graphql_1.GraphQLString;
    switch (typeof arg.type) {
        case 'string':
            if (arg.type == 'string') {
                type = graphql_1.GraphQLString;
            }
            else if (arg.type == 'integer') {
                type = graphql_1.GraphQLInt;
            }
            else if (arg.type == 'float') {
                type = graphql_1.GraphQLFloat;
            }
            else if (arg.type == 'boolean') {
                type = graphql_1.GraphQLBoolean;
            }
            else if (arg.type == 'id') {
                type = graphql_1.GraphQLID;
            }
            else {
                throw new Error('Undefined arg type: ' + arg.type);
            }
            break;
        default:
            let tt = arg.type();
            if (typeof tt == 'function') {
                if (tt.prototype.__graphql_type) {
                    type = getModel(tt.prototype.__graphql_type);
                }
                else {
                    console.trace(arg, arg.type);
                    throw new Error('The arg in not an Field: ' + typeof arg.type + ' as ' + arg.name);
                }
            }
            else {
                type = tt;
            }
    }
    if (arg.array) {
        type = new graphql_1.GraphQLList(type);
    }
    return type;
}
exports.getFieldType = getFieldType;
function getModel(model) {
    if (types[model.id]) {
        return types[model.id];
    }
    let target = undefined;
    let fields = {};
    types[model.id] = new graphql_1.GraphQLObjectType({
        name: model.id,
        fields: fields
    });
    for (let fieldName in model.fields) {
        let fieldRaw = model.fields[fieldName];
        if (fieldRaw instanceof ModelField) {
            let field = fieldRaw;
            if (field.substructure) {
                let tt = field.type();
                if (tt.prototype.__graphql_type instanceof Model) {
                    fields[field.name] = getField(tt.prototype.__graphql_type, model);
                }
                else {
                    throw new Error('Substructure should be a Model: ' + field.type);
                }
            }
            else {
                let args = {};
                for (let i in field.args) {
                    let arg = field.args[i];
                    args[arg.name] = {
                        type: getInputType(arg)
                    };
                }
                let type = getFieldType(field);
                fields[field.name] = {
                    type: type,
                    args: args,
                    resolve: (obj, argsRaw, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        let params = [];
                        for (let i in field.args) {
                            let arg = field.args[i];
                            params.push(argsRaw[arg.name]);
                        }
                        params.push(context);
                        if (typeof obj[fieldName] == "function") {
                            return yield obj[fieldName].apply(obj, params);
                        }
                        else {
                            return obj[fieldName];
                        }
                    })
                };
            }
        }
    }
    return types[model.id];
}
exports.getModel = getModel;
function getField(model, parent) {
    let constr = undefined;
    let args = {};
    if (model.constr) {
        for (let i in model.constr.args) {
            let arg = model.constr.args[i];
            args[arg.name] = {
                type: getInputType(arg)
            };
        }
        constr = (obj, argsRaw, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let params = [];
            for (let i in model.constr.args) {
                let arg = model.constr.args[i];
                params.push(argsRaw[arg.name]);
            }
            params.push(context);
            if (model.constr.name) {
                let target = new (Function.prototype.bind.apply(model.target, params));
                target.parent = obj;
                yield target[model.constr.name].apply(target, params);
                return target;
            }
            else {
                let target = new (Function.prototype.bind.apply(model.target, params));
                target.parent = obj;
                return target;
            }
        });
    }
    else {
        constr = (obj, argsRaw, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let target = new model.target();
            target.parent = obj;
            return target;
        });
    }
    let modelType = getModel(model);
    return {
        type: modelType,
        args: args,
        resolve: constr
    };
}
exports.getField = getField;
function getSub(model) {
    let args = {};
    for (let i in model.args) {
        let arg = model.args[i];
        args[arg.name] = {
            type: getInputType(arg)
        };
    }
    let resolve = (obj, argsRaw, context) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let params = [];
        for (let i in model.args) {
            let arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }
        params.push(obj);
        params.push(context);
        let target = yield model.value.apply(obj, params);
        return target;
    });
    let subscribe = (obj, argsRaw, context) => {
        let params = [];
        for (let i in model.args) {
            let arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }
        params.push(context);
        let target = model.subscribe.apply(obj, params).apply(obj, params);
        return target;
    };
    let type = getFieldType(model);
    return {
        type: type,
        args: args,
        resolve: resolve,
        subscribe: subscribe
    };
}
exports.getSub = getSub;
function getSchema() {
    let queryFields = {};
    for (let key in queries) {
        let element = queries[key];
        queryFields[key] = getField(element);
    }
    let mutationFields = {};
    for (let key in mutations) {
        let element = mutations[key];
        mutationFields[key] = getField(element);
    }
    let subscriptionFields = {};
    for (let key in subscriptions) {
        let element = subscriptions[key];
        subscriptionFields[key] = getSub(element);
    }
    const eventType = new graphql_1.GraphQLObjectType({
        name: 'Event',
        fields: {
            Id: {
                type: graphql_1.GraphQLInt
            },
            Name: {
                type: graphql_1.GraphQLString
            }
        }
    });
    let shema = {
        query: undefined,
    };
    if (Object.keys(queryFields).length > 0) {
        shema.query = new graphql_1.GraphQLObjectType({
            name: 'RootQuery',
            fields: queryFields
        });
    }
    if (Object.keys(mutationFields).length > 0) {
        shema.mutation = new graphql_1.GraphQLObjectType({
            name: 'RootMutation',
            fields: mutationFields
        });
    }
    if (Object.keys(subscriptionFields).length > 0) {
        shema.subscription = new graphql_1.GraphQLObjectType({
            name: 'RootSubscription',
            fields: subscriptionFields
        });
    }
    return new graphql_1.GraphQLSchema(shema);
}
exports.getSchema = getSchema;
let queries = {};
let mutations = {};
let subscriptions = {};
class ModelArg {
    constructor() {
        this.array = false;
    }
}
exports.ModelArg = ModelArg;
class ModelConstructor {
    constructor() {
        this.args = {};
        this.name = null;
    }
}
exports.ModelConstructor = ModelConstructor;
class ModelField {
    constructor() {
        this.substructure = false;
        this.array = false;
        this.args = {};
    }
}
exports.ModelField = ModelField;
class ModelSub {
    constructor() {
        this.array = false;
        this.args = {};
    }
}
exports.ModelSub = ModelSub;
class Model {
    constructor() {
        this.target = null;
        this.constr = null;
        this.fields = {};
    }
}
exports.Model = Model;
class ModelInputField {
    constructor() {
        this.array = false;
    }
}
exports.ModelInputField = ModelInputField;
class ModelInput {
    constructor() {
        this.fields = {};
    }
}
exports.ModelInput = ModelInput;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
class QueryOption {
}
exports.QueryOption = QueryOption;
function Query(options) {
    return (target) => {
        let name = options.name ? options.name : target.constructor.name;
        queries[name] = target.prototype.__graphql_type;
    };
}
exports.Query = Query;
class MutationOption {
}
exports.MutationOption = MutationOption;
function Mutation(options) {
    return (target) => {
        let name = options.name ? options.name : target.constructor.name;
        mutations[name] = target.prototype.__graphql_type;
    };
}
exports.Mutation = Mutation;
class SubscriptionOption {
    constructor() {
        this.array = false;
    }
}
exports.SubscriptionOption = SubscriptionOption;
function Subscription(type, subscribe, options = {}) {
    return (target, propertyKey, descriptor) => {
        let name = options.name ? options.name : propertyKey;
        if (!target[propertyKey].__graphql_sub) {
            target[propertyKey].__graphql_sub = new ModelSub();
        }
        target[propertyKey].__graphql_sub.name = options.name;
        target[propertyKey].__graphql_sub.type = type;
        target[propertyKey].__graphql_sub.subscribe = subscribe;
        target[propertyKey].__graphql_sub.array = options.array;
        target[propertyKey].__graphql_sub.value = descriptor.value;
        target[propertyKey].__graphql_sub.resolveType = options.resolveType;
        subscriptions[name] = target[propertyKey].__graphql_sub;
        let scope = options.scope ? options.scope : 'Main';
        if (!publishes['Main']) {
            publishes['Main'] = [];
        }
        if (publishes['Main'].indexOf(name) < 0) {
            publishes['Main'].push(name);
        }
    };
}
exports.Subscription = Subscription;
class SubscriptionArgOption {
    constructor() {
        this.nullable = true;
        this.constr = false;
        this.array = false;
    }
}
exports.SubscriptionArgOption = SubscriptionArgOption;
function SubscriptionArg(type, name, options = {}) {
    return (target, propertyKey, descriptor) => {
        if (!target[propertyKey].__graphql_sub) {
            target[propertyKey].__graphql_sub = new ModelSub();
        }
        if (!target[propertyKey].__graphql_sub.args[descriptor]) {
            target[propertyKey].__graphql_sub.args[descriptor] = new ModelArg();
        }
        target[propertyKey].__graphql_sub.args[descriptor].array = options.array;
        target[propertyKey].__graphql_sub.args[descriptor].name = name;
        target[propertyKey].__graphql_sub.args[descriptor].nullable = !!options.nullable;
        target[propertyKey].__graphql_sub.args[descriptor].type = type;
        target[propertyKey].__graphql_sub.args[descriptor].resolveType = options.resolveType;
    };
}
exports.SubscriptionArg = SubscriptionArg;
class StructureOption {
}
exports.StructureOption = StructureOption;
function Structure(id, options = {}) {
    return (target) => {
        if (!target.prototype.__graphql_type) {
            target.prototype.__graphql_type = new Model();
        }
        target.prototype.__graphql_type.id = id;
        Object.getOwnPropertyNames(target.prototype).forEach(member => {
            let memberDesc = Object.getOwnPropertyDescriptor(target.prototype, member);
            if (typeof memberDesc.value == "function") {
                if (member == 'constructor') {
                    if (!target.prototype.__graphql_type.constr) {
                        target.prototype.__graphql_type.constr = new ModelConstructor();
                    }
                }
            }
        });
        target.prototype.__graphql_type.target = target;
    };
}
exports.Structure = Structure;
class FieldOption {
    constructor() {
        this.substructure = false;
        this.array = false;
    }
}
exports.FieldOption = FieldOption;
function Field(type, options = {}) {
    return (target, propertyKey) => {
        let name = options.name ? options.name : propertyKey;
        if (!target.__graphql_type) {
            target.__graphql_type = new Model();
        }
        if (!target.__graphql_type.fields[propertyKey]) {
            target.__graphql_type.fields[propertyKey] = new ModelField();
        }
        target.__graphql_type.fields[propertyKey].name = name;
        target.__graphql_type.fields[propertyKey].type = type;
        target.__graphql_type.fields[propertyKey].substructure = options.substructure;
        target.__graphql_type.fields[propertyKey].array = options.array;
        target.__graphql_type.fields[propertyKey].resolveType = options.resolveType;
    };
}
exports.Field = Field;
class ArgOption {
    constructor() {
        this.nullable = true;
        this.constr = false;
        this.array = false;
    }
}
exports.ArgOption = ArgOption;
function Arg(type, name, options = {}) {
    return (target, propertyKey, descriptor) => {
        if (!propertyKey) {
            if (!target.prototype.__graphql_type) {
                target.prototype.__graphql_type = new Model();
            }
            if (!target.prototype.__graphql_type.constr) {
                target.prototype.__graphql_type.constr = new ModelConstructor();
            }
            if (!target.prototype.__graphql_type.constr.args[descriptor]) {
                target.prototype.__graphql_type.constr.args[descriptor] = new ModelArg();
            }
            target.prototype.__graphql_type.constr.args[descriptor].name = name;
            target.prototype.__graphql_type.constr.args[descriptor].nullable = !!options.nullable;
            target.prototype.__graphql_type.constr.args[descriptor].type = type;
            target.prototype.__graphql_type.constr.args[descriptor].array = options.array;
            target.prototype.__graphql_type.constr.args[descriptor].resolveType = options.resolveType;
        }
        else if (options.constr) {
            if (!target.__graphql_type) {
                target.__graphql_type = new Model();
            }
            if (!target.__graphql_type.constr) {
                target.__graphql_type.constr = new ModelConstructor();
            }
            if (!target.__graphql_type.constr.args[descriptor]) {
                target.__graphql_type.constr.args[descriptor] = new ModelArg();
            }
            target.__graphql_type.constr.args[descriptor].name = name;
            target.__graphql_type.constr.args[descriptor].nullable = !!options.nullable;
            target.__graphql_type.constr.args[descriptor].type = type;
            target.__graphql_type.constr.args[descriptor].array = options.array;
            target.__graphql_type.constr.args[descriptor].resolveType = options.resolveType;
        }
        else {
            if (!target.__graphql_type) {
                target.__graphql_type = new Model();
            }
            if (!target.__graphql_type.fields[propertyKey]) {
                target.__graphql_type.fields[propertyKey] = new ModelField();
            }
            if (!target.__graphql_type.fields[propertyKey].args[descriptor]) {
                target.__graphql_type.fields[propertyKey].args[descriptor] = new ModelArg();
            }
            target.__graphql_type.fields[propertyKey].args[descriptor].name = name;
            target.__graphql_type.fields[propertyKey].args[descriptor].nullable = !!options.nullable;
            target.__graphql_type.fields[propertyKey].args[descriptor].type = type;
            target.__graphql_type.fields[propertyKey].args[descriptor].array = options.array;
            target.__graphql_type.fields[propertyKey].args[descriptor].resolveType = options.resolveType;
        }
    };
}
exports.Arg = Arg;
function Constructor() {
    return (target, propertyKey, descriptor) => {
        if (!target.__graphql_type) {
            target.__graphql_type = new Model();
        }
        if (!target.__graphql_type.constr) {
            target.__graphql_type.constr = new ModelConstructor();
        }
        target.__graphql_type.constr.name = propertyKey;
    };
}
exports.Constructor = Constructor;
class InputFieldOption {
    constructor() {
        this.nullable = true;
        this.array = false;
    }
}
exports.InputFieldOption = InputFieldOption;
function InputField(type, options = {}) {
    return (target, propertyKey) => {
        let name = options.name ? options.name : propertyKey;
        if (!target.__graphql_input) {
            target.__graphql_input = new ModelInput();
        }
        if (!target.__graphql_input.fields[propertyKey]) {
            target.__graphql_input.fields[propertyKey] = new ModelInputField();
        }
        target.__graphql_input.fields[propertyKey].name = name;
        target.__graphql_input.fields[propertyKey].type = type;
        target.__graphql_input.fields[propertyKey].nullable = options.nullable;
        target.__graphql_input.fields[propertyKey].array = options.array;
        target.__graphql_input.fields[propertyKey].resolveType = options.resolveType;
    };
}
exports.InputField = InputField;
class InputOption {
}
exports.InputOption = InputOption;
function Input(id, options = {}) {
    return (target) => {
        if (!target.prototype.__graphql_input) {
            target.prototype.__graphql_input = new ModelInput();
        }
        target.prototype.__graphql_input.id = id;
        target.prototype.__graphql_input.target = target;
    };
}
exports.Input = Input;
//# sourceMappingURL=Query.js.map