import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLUnionType, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';
import * as Subscriptions from 'graphql-subscriptions';
import * as RedisNRP from 'node-redis-pubsub';

import { getConfig } from '../Modules/Config';

const publishes: { [name: string]: string[] } = {}
let nrp: RedisNRP;
export const pubsub: Subscriptions.PubSub = new Subscriptions.PubSub();

export class SubscriptionManager {
    private publishes: string[]
    private name: string

    constructor(name: string = 'Main') {
        this.name = name;
        this.publishes = publishes[name];
    }

    public init() {
        if (nrp) nrp = new RedisNRP(getConfig().redisPubSub[this.name]);
        if (this.publishes) for (let name of this.publishes) {
            nrp.on(name, function(data) {
                pubsub.publish(name, data);
            });
        }
    }
}

export async function Publish(name: string, data: any, scope: string = 'Main') {
    if (nrp) nrp = new RedisNRP(getConfig().redisPubSub[scope]);
    nrp.emit(name, data);
}

export function Subscribe(name: string, basic?: Function, filter?: (payload, variables) => boolean) {
    if (filter) {
        return Subscriptions.withFilter(() => {
            if (basic) basic();
            return pubsub.asyncIterator(name);
        }, filter);
    } else {
        return basic ? Subscriptions.withFilter(() => {
            basic();
            return pubsub.asyncIterator(name);
        }, () => true) : pubsub.asyncIterator(name);
    }
}

// export const EnumType = GraphQLEnumType;
// export const ScalarType = GraphQLScalarType;
// export const GraphQLError = GraphQLError;
// export const Kind = Kind;

let typesInput = {};
let types = {};

export type FieldType = Function | 'string' | 'integer' | 'boolean' | 'float' | 'id';

export function getInputModelType(model: ModelInput) {
    if (typesInput[model.id]) {
        return typesInput[model.id];
    }

    let fields = {};
    for (let i in model.fields) {
        let field = model.fields[i];
        fields[field.name] = {
            type: getInputType(field)
        }
    }

    typesInput[model.id] = new GraphQLInputObjectType({
        name: model.id,
        fields: fields
    });

    return typesInput[model.id];
}

export function getInputTypeSimple(t: any, arg: ModelArg | ModelInputField) {
    let type: any = GraphQLString;

    switch (typeof t) {
        case 'string':
            if (t == 'string') {
                type = GraphQLString;
            }
            else if (t == 'integer') {
                type = GraphQLInt;
            }
            else if (t == 'float') {
                type = GraphQLFloat;
            }
            else if (t == 'boolean') {
                type = GraphQLBoolean;
            }
            else if (t == 'id') {
                type = GraphQLID;
            }
            else {
                throw new Error('Undefined arg type: ' + t);
            }
            break;
        default:
            if (Array.isArray(t)) {
                const types = t.forEach(t => getInputTypeSimple(t, arg))
                type = GraphQLUnionType
            }
            else {
                let tt = (t as Function)();

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
        type = new GraphQLNonNull(type);
    }

    if (arg.array) {
        type = new GraphQLList(type);
    }

    return type;
}

export function getInputType(arg: ModelArg | ModelInputField) {
    if (Array.isArray(arg.type)) {
        const uTypes = arg.type.map(t => ({ t, type: getInputTypeSimple(t, arg) }));
        const type = new GraphQLUnionType({
            name: 'Union' + arg.name,
            types: uTypes.map(t => t.type),
            resolveType: (value) => {
                const t = uTypes.find(t => t.t === arg.resolveType(value));
                return t && t.type;
            }
        })
        return type;
    }
    else {
        return getInputTypeSimple(arg.type, arg);
    }
}

export function getFieldType(arg: ModelField | ModelSub) {
    let type: any = GraphQLString;

    switch (typeof arg.type) {
        case 'string':
            if (arg.type == 'string') {
                type = GraphQLString;
            }
            else if (arg.type == 'integer') {
                type = GraphQLInt;
            }
            else if (arg.type == 'float') {
                type = GraphQLFloat;
            }
            else if (arg.type == 'boolean') {
                type = GraphQLBoolean;
            }
            else if (arg.type == 'id') {
                type = GraphQLID;
            }
            else {
                throw new Error('Undefined arg type: ' + arg.type);
            }
            break;
        default:
            let tt = (arg.type as Function)();

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
        type = new GraphQLList(type);
    }

    return type;
}

export function getModel(model: Model) {
    if (types[model.id]) {
        return types[model.id];
    }

    let target = undefined;

    let fields = {};

    types[model.id] = new GraphQLObjectType({
        name: model.id,
        fields: fields
    });

    for (let fieldName in model.fields) {
        let fieldRaw = model.fields[fieldName];

        if (fieldRaw instanceof ModelField) {
            let field: ModelField = fieldRaw as ModelField;

            if (field.substructure) {
                let tt = (field.type as Function)();
                if (tt.prototype.__graphql_type instanceof Model) {
                    fields[field.name] = getField(tt.prototype.__graphql_type as Model, model);
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
                    }
                }

                let type = getFieldType(field);

                fields[field.name] = {
                    type: type,
                    args: args,
                    resolve: async (obj, argsRaw, context) => {
                        let params = [];
                        for (let i in field.args) {
                            let arg = field.args[i];
                            params.push(argsRaw[arg.name]);
                        }

                        params.push(context);

                        if (typeof obj[fieldName] == "function") {
                            return await obj[fieldName].apply(obj, params);
                        }
                        else {
                            return obj[fieldName];
                        }
                    }
                }
            }
        }
    }

    return types[model.id];
}

export function getField(model: Model, parent?: Model) {

    let constr = undefined;
    let args = {};

    if (model.constr) {
        for (let i in model.constr.args) {
            let arg = model.constr.args[i];
            args[arg.name] = {
                type: getInputType(arg)
            }
        }

        constr = async (obj, argsRaw, context) => {
            let params = [];
            for (let i in model.constr.args) {
                let arg = model.constr.args[i];
                params.push(argsRaw[arg.name]);
            }

            params.push(context);

            if (model.constr.name) {
                let target = new (Function.prototype.bind.apply(model.target, params));
                target.parent = obj;
                await target[model.constr.name].apply(target, params);
                return target;
            }
            else {
                let target = new (Function.prototype.bind.apply(model.target, params));
                target.parent = obj;
                return target;
            }
        }
    }
    else {
        constr = async (obj, argsRaw, context) => {
            let target = new model.target();
            target.parent = obj;
            return target;
        }
    }

    let modelType = getModel(model);

    return {
        type: modelType,
        args: args,
        resolve: constr
    }
}

export function getSub(model: ModelSub) {

    let args = {};

    for (let i in model.args) {
        let arg = model.args[i];
        args[arg.name] = {
            type: getInputType(arg)
        }
    }

    let resolve = async (obj, argsRaw, context) => {
        let params = [];
        for (let i in model.args) {
            let arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }

        params.push(obj);
        params.push(context);

        let target = await model.value.apply(obj, params);
        return target;
    }

    let subscribe = (obj, argsRaw, context) => {
        let params = [];
        for (let i in model.args) {
            let arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }

        params.push(context);

        let target = model.subscribe.apply(obj, params).apply(obj, params);
        return target;
    }

    let type = getFieldType(model);

    return {
        type: type,
        args: args,
        resolve: resolve,
        subscribe: subscribe
    }
}

export function getSchema() {

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

    const eventType = new GraphQLObjectType({
        name: 'Event',
        fields: {
            Id: {
                type: GraphQLInt
            },
            Name: {
                type: GraphQLString
            }
        }
    });

    let shema: { query: GraphQLObjectType, mutation?: GraphQLObjectType, subscription?: GraphQLObjectType } = {
        query: undefined,
    };

    if (Object.keys(queryFields).length > 0) {
        shema.query = new GraphQLObjectType({
            name: 'RootQuery',
            fields: queryFields
        });
    }

    if (Object.keys(mutationFields).length > 0) {
        shema.mutation = new GraphQLObjectType({
            name: 'RootMutation',
            fields: mutationFields
        });
    }

    if (Object.keys(subscriptionFields).length > 0) {
        shema.subscription = new GraphQLObjectType({
            name: 'RootSubscription',
            fields: subscriptionFields
        });
    }

    return new GraphQLSchema(shema);
}

let queries: {
    [name: string]: Model
} = {};

let mutations: {
    [name: string]: Model
} = {};

let subscriptions: {
    [name: string]: ModelSub
} = {}

export class ModelArg {
    name: string
    type: FieldType | FieldType[]
    nullable: boolean
    array: boolean = false
    resolveType: (value) => FieldType
}

export class ModelConstructor {
    args: { [name: string]: ModelArg; } = {}
    name: string = null
}

export class ModelField {
    name: string
    type: FieldType | FieldType[]
    substructure: boolean = false
    array: boolean = false
    resolveType: (value) => FieldType

    args: { [name: string]: ModelArg; } = {}
}

export class ModelSub {
    name: string
    type: FieldType | FieldType[]
    array: boolean = false
    subscribe: Function
    value: Function
    resolveType: (value) => FieldType

    args: { [name: string]: ModelArg; } = {}
}

export class Model {
    id: string
    target: any = null

    constr: ModelConstructor = null

    fields: { [name: string]: ModelField | Model; } = {};
}

export class ModelInputField {
    name: string
    type: FieldType | FieldType[]
    nullable: boolean
    array: boolean = false
    resolveType: (value) => FieldType
}

export class ModelInput {
    id: string
    fields: { [name: string]: ModelInputField; } = {};
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export class QueryOption {
    name: string
}

export function Query(options: QueryOption): (target: any) => void {

    return (target: any): void => {
        let name = options.name ? options.name : target.constructor.name;

        queries[name] = target.prototype.__graphql_type;
    };
}

export class MutationOption {
    name: string
}

export function Mutation(options: MutationOption): (target: any) => void {

    return (target: any): void => {
        let name = options.name ? options.name : target.constructor.name;

        mutations[name] = target.prototype.__graphql_type;
    };
}

export class SubscriptionOption {
    name?: string
    array?: boolean = false
    resolveType?: (value) => FieldType
    scope?: string
}

export function Subscription(type: FieldType | FieldType[], subscribe: Function, options: SubscriptionOption = {}): (target: any, propertyKey: string, descriptor: any) => void {

    return (target: any, propertyKey: string, descriptor: any): void => {
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

export class SubscriptionArgOption {
    nullable?: boolean = true
    constr?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export function SubscriptionArg(type: FieldType | FieldType[], name: string, options: SubscriptionArgOption = {}): (target: any, propertyKey: string, descriptor: number) => void {

    return (target: any, propertyKey: string, descriptor: number): void => {
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

export class StructureOption {
}

export function Structure(id: string, options: StructureOption = {}): (target: any) => any {

    return (target: any): any => {

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
        })

        target.prototype.__graphql_type.target = target;
    };
}

export class FieldOption {
    name?: string
    substructure?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export function Field(type: FieldType | FieldType[], options: FieldOption = {}): (target: any, propertyKey: string) => void {

    return (target: any, propertyKey: string): void => {
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

export class ArgOption {
    nullable?: boolean = true
    constr?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export function Arg(type: FieldType | FieldType[], name: string, options: ArgOption = {}): (target: any, propertyKey: string, descriptor: number) => void {

    return (target: any, propertyKey: string, descriptor: number): void => {
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

export function Constructor(): (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {

    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {

        if (!target.__graphql_type) {
            target.__graphql_type = new Model();
        }

        if (!target.__graphql_type.constr) {
            target.__graphql_type.constr = new ModelConstructor();
        }

        target.__graphql_type.constr.name = propertyKey;
    };
}

export class InputFieldOption {
    name?: string
    nullable?: boolean = true
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export function InputField(type: FieldType | FieldType[], options: InputFieldOption = {}): (target: any, propertyKey: string) => void {

    return (target: any, propertyKey: string): void => {
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

export class InputOption {
}

export function Input(id: string, options: InputOption = {}): (target: any) => void {

    return (target: any): void => {

        if (!target.prototype.__graphql_input) {
            target.prototype.__graphql_input = new ModelInput();
        }

        target.prototype.__graphql_input.id = id;
        target.prototype.__graphql_input.target = target;
    };
}