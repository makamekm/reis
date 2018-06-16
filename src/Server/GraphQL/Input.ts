import {
    GraphQLObjectType,
    GraphQLNullableType,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
} from 'graphql';

import {
    ModelInput,
    ModelArg,
    ModelInputField,
    ModelField,
    ModelSub,
    Model,
    inputMetadataKey,
    typeMetadataKey
} from './Model';

const typesInput = {};
const types = {};

export function getInputModelType(model: ModelInput) {
    if (typesInput[model.id]) {
        return typesInput[model.id];
    }

    const fields = {};
    for (const i in model.fields) {
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

export function getInputTypeSimple(t: string | Function, arg: ModelArg | ModelInputField): GraphQLNullableType {
    let type: GraphQLNullableType = GraphQLString;

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
                throw new Error('Undefined arg type: ' + t + ' for ' + arg.name);
            }
            break;
        case 'object':
            if (Array.isArray(t)) {
                // TODO: Make union types
                // const types = t.forEach(t => getInputTypeSimple(t, arg));
                // type = GraphQLUnionType;
            } else {
                throw new Error('The arg type: ' + typeof arg.type + ' should be String or Function [() => Class or GraphQLType] or an array of them for ' + arg.name);
            }
            break;
        case 'function':
            let func = (t as Function)();
            if (typeof func == 'function') {
                let inputModel: ModelInput = Reflect.getMetadata(inputMetadataKey, func) || Reflect.getMetadata(inputMetadataKey, func.prototype);
                if (inputModel) {
                    type = getInputModelType(inputModel);
                } else {
                    throw new Error('The arg type: ' + typeof arg.type + ' does not have Model for ' + arg.name);
                }
            } else {
                type = func;
            }
            break;
        default:
            throw new Error('The arg type: ' + typeof arg.type + ' should be String or Function [() => Class or GraphQLType] or an array of them for ' + arg.name);
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
        // TODO: Make union types
        // const unionTypes = arg.type.map(t => ({ t, type: getInputTypeSimple(t, arg) }));
        // const type = new GraphQLUnionType({
        //     name: 'Union' + arg.name,
        //     types: unionTypes.map(t => t.type),
        //     resolveType: (value) => {
        //         const resolvedType = unionTypes.find(t => t.t === arg.resolveType(value));
        //         return resolvedType && resolvedType.type;
        //     }
        // })
        // return type;
        throw new Error('Not implemented!');
    } else {
        return getInputTypeSimple(arg.type, arg);
    }
}

export function getFieldType(arg: ModelField | ModelSub): GraphQLNullableType {
    let type: GraphQLNullableType = GraphQLString;

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
                throw new Error('Undefined arg type: ' + arg.type + ' for ' + arg.name);
            }
            break;
        case 'function':
            let func = (arg.type as Function)();
            if (typeof func == 'function') {
                let inputModel: Model = Reflect.getMetadata(typeMetadataKey, func) || Reflect.getMetadata(typeMetadataKey, func.prototype);
                if (inputModel) {
                    type = getModelType(inputModel);
                } else {
                    throw new Error('The arg type: ' + typeof arg.type + ' does not have Model for ' + arg.name);
                }
            } else {
                type = func;
            }
            break;
        default:
            throw new Error('The arg type: ' + typeof arg.type + ' should be a string or a function [() => Class or GraphQLType] for ' + arg.name);
    }

    if (arg.array) {
        type = new GraphQLList(type);
    }

    return type;
}

export function getModelType(model: Model) {
    if (types[model.id]) {
        return types[model.id];
    }

    const fields = {};

    types[model.id] = new GraphQLObjectType({
        name: model.id,
        fields: fields
    });

    for (const fieldName in model.fields) {
        const fieldRaw = model.fields[fieldName];

        if (fieldRaw instanceof ModelField) {
            const field: ModelField = fieldRaw as ModelField;

            if (field.substructure) {
                const func = (field.type as Function)();
                const inputModel: Model = Reflect.getMetadata(typeMetadataKey, func) || Reflect.getMetadata(typeMetadataKey, func.prototype);
                if (inputModel instanceof Model) {
                    fields[field.name] = getField(inputModel);
                } else {
                    throw new Error('Substructure should be Model: ' + field.type);
                }
            } else {
                const args = {};

                for (const i in field.args) {
                    const arg = field.args[i];
                    args[arg.name] = {
                        type: getInputType(arg)
                    }
                }

                const type = getFieldType(field);

                fields[field.name] = {
                    type: type,
                    args: args,
                    resolve: async (obj, argsRaw, context) => {
                        const params = [];
                        for (const i in field.args) {
                            const arg = field.args[i];
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

export function getField(model: Model) {
    let constr = undefined;
    const args = {};

    if (model.constr) {
        for (const i in model.constr.args) {
            const arg = model.constr.args[i];
            args[arg.name] = {
                type: getInputType(arg)
            }
        }

        constr = async (obj, argsRaw, context) => {
            const params = [];
            for (const i in model.constr.args) {
                const arg = model.constr.args[i];
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
            const target = new model.target();
            target.parent = obj;
            return target;
        }
    }

    const modelType = getModelType(model);

    return {
        type: modelType,
        args,
        resolve: constr
    }
}

export function getSubscriptionField(model: ModelSub) {

    const args = {};

    for (const i in model.args) {
        const arg = model.args[i];
        args[arg.name] = {
            type: getInputType(arg)
        }
    }

    const resolve = async (obj, argsRaw, context) => {
        const params = [];
        for (const i in model.args) {
            const arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }

        params.push(obj);
        params.push(context);

        const target = await model.value.apply(obj, params);
        return target;
    }

    const subscribe = (obj, argsRaw, context) => {
        const params = [];
        for (const i in model.args) {
            const arg = model.args[i];
            params.push(argsRaw[arg.name]);
        }

        params.push(context);

        const target = model.subscribe.apply(obj, params).apply(obj, params);
        return target;
    }

    const type = getFieldType(model);

    return {
        type: type,
        args: args,
        resolve: resolve,
        subscribe: subscribe
    }
}