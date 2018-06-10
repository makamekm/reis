import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLUnionType, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';

import { getPublishes } from './GraphQL/SubscriptionManager';
export { SubscriptionManager, Subscribe, Publish } from './GraphQL/SubscriptionManager';

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
    getSub
} from './GraphQL/Input';

type Schema = { query: GraphQLObjectType, mutation?: GraphQLObjectType, subscription?: GraphQLObjectType }

let queries: {
    [name: string]: Model
} = {};

let mutations: {
    [name: string]: Model
} = {};

let subscriptions: {
    [name: string]: ModelSub
} = {}

export function getSchema() {
    let queryFields = {};

    for (let key in queries) {
        queryFields[key] = getField(queries[key]);
    }

    let mutationFields = {};

    for (let key in mutations) {
        mutationFields[key] = getField(mutations[key]);
    }

    let subscriptionFields = {};

    for (let key in subscriptions) {
        subscriptionFields[key] = getSub(subscriptions[key]);
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

    let shema: Schema = {
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

export function Query(options: QueryOption): (target: any) => void {
    return (target: any): void => {
        let name = options.name ? options.name : target.constructor.name;
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        if (!model) {
            model = new Model();
        }
        Reflect.metadata(typeMetadataKey, model)(target);
        queries[name] = model;
    }
}

export function Mutation(options: MutationOption): (target: any) => void {
    return (target: any): void => {
        let name = options.name ? options.name : target.constructor.name;
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        mutations[name] = model;
    }
}

export function Subscription(type: FieldType | FieldType[], subscribe: Function, options: SubscriptionOption = {}): (target: any, propertyKey: string, descriptor: any) => void {
    return (target: any, propertyKey: string, descriptor: any): void => {
        let name = options.name ? options.name : propertyKey;
        let model: ModelSub = Reflect.getMetadata(subMetadataKey, target);
        if (!model) {
            model = new ModelSub();
        }
        if (!model) {
            model = new ModelSub();
        }
        model.name = options.name;
        model.type = type;
        model.subscribe = subscribe;
        model.array = options.array;
        model.value = descriptor.value;
        model.resolveType = options.resolveType;
        subscriptions[name] = model;
        let scope = options.scope ? options.scope : 'Main';
        if (!getPublishes()[scope]) {
            getPublishes()[scope] = [];
        }
        if (getPublishes()[scope].indexOf(name) < 0) {
            getPublishes()[scope].push(name);
        }
        Reflect.metadata(typeMetadataKey, model)(target);
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

export function Structure(id: string, options: StructureOption = {}): (target: any) => any {
    return (target: any): any => {
        let model: Model = Reflect.getMetadata(typeMetadataKey, target);
        if (!model) {
            model = new Model();
        }
        model.id = id;
        Object.getOwnPropertyNames(target.prototype).forEach(member => {
            let memberDesc = Object.getOwnPropertyDescriptor(target.prototype, member);

            if (typeof memberDesc.value == "function") {
                if (member == 'constructor') {
                    if (!model.constr) {
                        model.constr = new ModelConstructor();
                    }
                }
            }
        })
        model.target = target;
        Reflect.metadata(typeMetadataKey, model)(target);
    }
}

export function Field(type: FieldType | FieldType[], options: FieldOption = {}): (target: any, propertyKey: string) => void {
    return (target: any, propertyKey: string): void => {
        let name = options.name ? options.name : propertyKey;
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
        let name = options.name ? options.name : propertyKey;
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

export function Input(id: string, options: InputOption = {}): (target: any) => void {
    return (target: any): void => {
        let model: ModelInput = Reflect.getMetadata(inputMetadataKey, target);
        if (!model) {
            model = new ModelInput();
        }
        model.id = id;
        // model.target = target;
        Reflect.metadata(inputMetadataKey, model)(target);
    }
}