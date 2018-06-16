import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLUnionType, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';

import { getPublishes } from './GraphQL/SubscriptionManager';
export {
    SubscriptionManager,
    Subscribe,
    Publish
} from './GraphQL/SubscriptionManager';

import {
    FieldType,
    Model,
    ModelSub,
    QueryOption,
    MutationOption,
    SubscriptionOption,
    SubscriptionArgOption,
    ModelArg,
    StructureOption,
    ModelConstructor,
    FieldOption,
    ModelField,
    ArgOption,
    InputFieldOption,
    ModelInput,
    ModelInputField,
    InputOption,
    inputMetadataKey,
    typeMetadataKey,
    subMetadataKey
} from './GraphQL/Model';
import {
    getField,
    getSubscriptionField
} from './GraphQL/Input';

type Schema = {
    query: GraphQLObjectType
    mutation?: GraphQLObjectType
    subscription?: GraphQLObjectType
}

const queriesModel: {
    [name: string]: Model
} = {};
const mutationsModel: {
    [name: string]: Model
} = {};
const subscriptionsModel: {
    [name: string]: ModelSub
} = {};

let schema: GraphQLSchema
export function getSchema() {
    if (!schema) {
        schema = genSchema();
    }
    return schema;
}

let schemaSubscription: GraphQLSchema
export function getSubscriptionSchema() {
    if (!schemaSubscription) {
        schemaSubscription = genSubscriptionSchema();
    }
    return schemaSubscription;
}

function genSchema(): GraphQLSchema {
    const queryFields = {};

    for (const key in queriesModel) {
        queryFields[key] = getField(queriesModel[key]);
    }

    const mutationFields = {};

    for (const key in mutationsModel) {
        mutationFields[key] = getField(mutationsModel[key]);
    }

    const shema: Schema = {
        query: undefined,
    }

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

    return new GraphQLSchema(shema);
}

function genSubscriptionSchema(): GraphQLSchema {
    const subscriptionFields = {};

    for (const key in subscriptionsModel) {
        subscriptionFields[key] = getSubscriptionField(subscriptionsModel[key]);
    }

    const shema: Schema = {
        query: undefined
    }

    if (Object.keys(subscriptionFields).length > 0) {
        shema.subscription = new GraphQLObjectType({
            name: 'RootSubscription',
            fields: subscriptionFields
        });
    }

    return new GraphQLSchema(shema);
}

export function Query(options: QueryOption): (target: any) => void {
    return (target: any): void => {
        const name = options.name ? options.name : target.constructor.name;
        const model: Model = Reflect.getMetadata(typeMetadataKey, target.prototype);
        queriesModel[name] = model;
    }
}

export function Mutation(options: MutationOption): (target: any) => void {
    return (target: any): void => {
        const name = options.name ? options.name : target.constructor.name;
        const model: Model = Reflect.getMetadata(typeMetadataKey, target.prototype);
        mutationsModel[name] = model;
    }
}

export function Structure(id: string, options: StructureOption = {}): (target: any) => any {
    return (target: any): any => {
        let model: Model = Reflect.getMetadata(typeMetadataKey, target.prototype);
        if (!model) {
            model = new Model();
        }
        model.id = id;
        model.target = target;
        Object.getOwnPropertyNames(target.prototype).forEach(member => {
            const memberDesc = Object.getOwnPropertyDescriptor(target.prototype, member);
            if (typeof memberDesc.value == 'function') {
                if (member == 'constructor') {
                    if (!model.constr) {
                        model.constr = new ModelConstructor();
                    }
                }
            }
        })
        Reflect.metadata(typeMetadataKey, model)(target.prototype);
    }
}

export function Input(id: string, options: InputOption = {}): (target: any) => void {
    return (target: any): void => {
        let model: ModelInput = Reflect.getMetadata(inputMetadataKey, target.prototype);
        if (!model) {
            model = new ModelInput();
        }
        model.id = id;
        // model.target = target;
        Reflect.metadata(inputMetadataKey, model)(target.prototype);
    }
}

export function Subscription(type: FieldType | FieldType[], subscribe: Function, options: SubscriptionOption = {}): (target: any, propertyKey: string, descriptor: any) => void {
    return (target: any, propertyKey: string, descriptor: any): void => {
        const name = options.name ? options.name : propertyKey;
        const scope = options.scope ? options.scope : 'Main';
        let model: ModelSub = Reflect.getMetadata(subMetadataKey, target);
        if (!model) {
            model = new ModelSub();
        }
        model.name = options.name;
        model.type = type;
        model.subscribe = subscribe;
        model.array = options.array;
        model.value = descriptor.value;
        model.resolveType = options.resolveType;
        if (!getPublishes()[scope]) {
            getPublishes()[scope] = [];
        }
        if (getPublishes()[scope].indexOf(name) < 0) {
            getPublishes()[scope].push(name);
        }
        Reflect.metadata(typeMetadataKey, model)(target);
        subscriptionsModel[name] = model;
    }
}

export function SubscriptionArg(type: FieldType | FieldType[], name: string, options: SubscriptionArgOption = {}): (target: any, propertyKey: string, descriptor: number) => void {
    return (target: any, propertyKey: string, descriptor: number): void => {
        let model: ModelSub = Reflect.getMetadata(subMetadataKey, target);
        if (!model) {
            model = new ModelSub();
        }
        if (!model.args[descriptor]) {
            model.args[descriptor] = new ModelArg();
        }
        model.args[descriptor].array = options.array;
        model.args[descriptor].name = name;
        model.args[descriptor].nullable = !!options.nullable;
        model.args[descriptor].type = type;
        model.args[descriptor].resolveType = options.resolveType;
        Reflect.metadata(typeMetadataKey, model)(target);
    }
}

export function Field(type: FieldType | FieldType[], options: FieldOption = {}): (target: any, propertyKey: string) => void {
    return (target: any, propertyKey: string): void => {
        const name = options.name ? options.name : propertyKey;
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        if (!model) {
            model = new Model();
        }
        if (!model.fields[propertyKey]) {
            model.fields[propertyKey] = new ModelField();
        }
        model.fields[propertyKey].name = name;
        model.fields[propertyKey].type = type;
        model.fields[propertyKey].substructure = options.substructure;
        model.fields[propertyKey].array = options.array;
        model.fields[propertyKey].resolveType = options.resolveType;
        Reflect.metadata(typeMetadataKey, model)(target);
    }
}

export function Arg(type: FieldType | FieldType[], name: string, options: ArgOption = {}): (target: any, propertyKey: string, descriptor: number) => void {
    return (target: any, propertyKey: string, descriptor: number): void => {
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        if (!model) {
            model = new Model();
        }
        if (!propertyKey) {
            if (!model.constr) {
                model.constr = new ModelConstructor();
            }
            if (!model.constr.args[descriptor]) {
                model.constr.args[descriptor] = new ModelArg();
            }
            model.constr.args[descriptor].name = name;
            model.constr.args[descriptor].nullable = !!options.nullable;
            model.constr.args[descriptor].type = type;
            model.constr.args[descriptor].array = options.array;
            model.constr.args[descriptor].resolveType = options.resolveType;
        } else if (options.constr) {
            if (!model.constr) {
                model.constr = new ModelConstructor();
            }
            if (!model.constr.args[descriptor]) {
                model.constr.args[descriptor] = new ModelArg();
            }
            model.constr.args[descriptor].name = name;
            model.constr.args[descriptor].nullable = !!options.nullable;
            model.constr.args[descriptor].type = type;
            model.constr.args[descriptor].array = options.array;
            model.constr.args[descriptor].resolveType = options.resolveType;
        } else {
            if (!model.fields[propertyKey]) {
                model.fields[propertyKey] = new ModelField();
            }
            if (!model.fields[propertyKey].args[descriptor]) {
                model.fields[propertyKey].args[descriptor] = new ModelArg();
            }
            model.fields[propertyKey].args[descriptor].name = name;
            model.fields[propertyKey].args[descriptor].nullable = !!options.nullable;
            model.fields[propertyKey].args[descriptor].type = type;
            model.fields[propertyKey].args[descriptor].array = options.array;
            model.fields[propertyKey].args[descriptor].resolveType = options.resolveType;
        }
        Reflect.metadata(typeMetadataKey, model)(target);
    }
}

export function Constructor(): (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void => {
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        if (!model) {
            model = new Model();
        }
        if (!model.constr) {
            model.constr = new ModelConstructor();
        }
        model.constr.name = propertyKey;
        Reflect.metadata(typeMetadataKey, model)(target);
    }
}

export function InputField(type: FieldType | FieldType[], options: InputFieldOption = {}): (target: any, propertyKey: string) => void {
    return (target: any, propertyKey: string): void => {
        const name = options.name ? options.name : propertyKey;
        let model: ModelInput = Reflect.getMetadata(inputMetadataKey, target);
        if (!model) {
            model = new ModelInput();
        }
        if (!model.fields[propertyKey]) {
            model.fields[propertyKey] = new ModelInputField();
        }
        model.fields[propertyKey].name = name;
        model.fields[propertyKey].type = type;
        model.fields[propertyKey].nullable = options.nullable;
        model.fields[propertyKey].array = options.array;
        model.fields[propertyKey].resolveType = options.resolveType;
        Reflect.metadata(inputMetadataKey, model)(target);
    }
}