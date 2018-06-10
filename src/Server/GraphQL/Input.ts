import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLUnionType, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';

import {
    ModelInput,
    ModelArg,
    ModelInputField,
    ModelField,
    ModelSub,
    Model,
    inputMetadataKey,
    typeMetadataKey,
    subMetadataKey
} from './Model';

let typesInput = {};
let types = {};

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
            } else if (t == 'integer') {
                type = GraphQLInt;
            } else if (t == 'float') {
                type = GraphQLFloat;
            } else if (t == 'boolean') {
                type = GraphQLBoolean;
            } else if (t == 'id') {
                type = GraphQLID;
            } else {
                throw new Error('Undefined arg type: ' + t);
            }
            break;
        default:
            if (Array.isArray(t)) {
                const types = t.forEach(t => getInputTypeSimple(t, arg))
                type = GraphQLUnionType
            } else {
                let tt = (t as Function)();

                if (typeof tt == 'function') {
                    let inputModel: ModelInput = Reflect.getMetadata(inputMetadataKey, tt);
                    if (inputModel) {
                        type = getInputModelType(inputModel);
                    } else {
                        console.trace(arg, t);
                        throw new Error('The arg in not an Input: ' + typeof arg.type);
                    }
                } else {
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
    } else {
        return getInputTypeSimple(arg.type, arg);
    }
}

export function getFieldType(arg: ModelField | ModelSub) {
    let type: any = GraphQLString;

    switch (typeof arg.type) {
        case 'string':
            if (arg.type == 'string') {
                type = GraphQLString;
            } else if (arg.type == 'integer') {
                type = GraphQLInt;
            } else if (arg.type == 'float') {
                type = GraphQLFloat;
            } else if (arg.type == 'boolean') {
                type = GraphQLBoolean;
            } else if (arg.type == 'id') {
                type = GraphQLID;
            } else {
                throw new Error('Undefined arg type: ' + arg.type);
            }
            break;
        default:
            let tt = (arg.type as Function)();

            if (typeof tt == 'function') {
                let inputModel: Model = Reflect.getMetadata(typeMetadataKey, tt);
                if (inputModel) {
                    type = getModel(inputModel);
                } else {
                    console.trace(arg, arg.type);
                    throw new Error('The arg in not an Field: ' + typeof arg.type + ' as ' + arg.name);
                }
            } else {
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
                let inputModel: Model = Reflect.getMetadata(typeMetadataKey, tt);
                if (inputModel instanceof Model) {
                    fields[field.name] = getField(inputModel, model);
                } else {
                    throw new Error('Substructure should be a Model: ' + field.type);
                }
            } else {
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
                        } else {
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
            } else {
                let target = new (Function.prototype.bind.apply(model.target, params));
                target.parent = obj;
                return target;
            }
        }
    } else {
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