export { Request, Response } from 'express-serve-static-core';
import { GraphQLSchema } from 'graphql';
import * as Subscriptions from 'graphql-subscriptions';
export declare const pubsub: Subscriptions.PubSub;
export declare class SubscriptionManager {
    private publishes;
    private name;
    constructor(name?: string);
    init(): void;
}
export declare function Publish(name: string, data: any, scope?: string): Promise<void>;
export declare function Subscribe(name: string, basic?: Function, filter?: (payload, variables) => boolean): Subscriptions.ResolverFn | AsyncIterator<{}>;
export declare type FieldType = Function | 'string' | 'integer' | 'boolean' | 'float' | 'id';
export declare function getInputModelType(model: ModelInput): any;
export declare function getInputTypeSimple(t: any, arg: ModelArg | ModelInputField): any;
export declare function getInputType(arg: ModelArg | ModelInputField): any;
export declare function getFieldType(arg: ModelField | ModelSub): any;
export declare function getModel(model: Model): any;
export declare function getField(model: Model, parent?: Model): {
    type: any;
    args: {};
    resolve: any;
};
export declare function getSub(model: ModelSub): {
    type: any;
    args: {};
    resolve: (obj: any, argsRaw: any, context: any) => Promise<any>;
    subscribe: (obj: any, argsRaw: any, context: any) => any;
};
export declare function getSchema(): GraphQLSchema;
export declare class ModelArg {
    name: string;
    type: FieldType | FieldType[];
    nullable: boolean;
    array: boolean;
    resolveType: (value) => FieldType;
}
export declare class ModelConstructor {
    args: {
        [name: string]: ModelArg;
    };
    name: string;
}
export declare class ModelField {
    name: string;
    type: FieldType | FieldType[];
    substructure: boolean;
    array: boolean;
    resolveType: (value) => FieldType;
    args: {
        [name: string]: ModelArg;
    };
}
export declare class ModelSub {
    name: string;
    type: FieldType | FieldType[];
    array: boolean;
    subscribe: Function;
    value: Function;
    resolveType: (value) => FieldType;
    args: {
        [name: string]: ModelArg;
    };
}
export declare class Model {
    id: string;
    target: any;
    constr: ModelConstructor;
    fields: {
        [name: string]: ModelField | Model;
    };
}
export declare class ModelInputField {
    name: string;
    type: FieldType | FieldType[];
    nullable: boolean;
    array: boolean;
    resolveType: (value) => FieldType;
}
export declare class ModelInput {
    id: string;
    fields: {
        [name: string]: ModelInputField;
    };
}
export declare class QueryOption {
    name: string;
}
export declare function Query(options: QueryOption): (target: any) => void;
export declare class MutationOption {
    name: string;
}
export declare function Mutation(options: MutationOption): (target: any) => void;
export declare class SubscriptionOption {
    name?: string;
    array?: boolean;
    resolveType?: (value) => FieldType;
    scope?: string;
}
export declare function Subscription(type: FieldType | FieldType[], subscribe: Function, options?: SubscriptionOption): (target: any, propertyKey: string, descriptor: any) => void;
export declare class SubscriptionArgOption {
    nullable?: boolean;
    constr?: boolean;
    array?: boolean;
    resolveType?: (value) => FieldType;
}
export declare function SubscriptionArg(type: FieldType | FieldType[], name: string, options?: SubscriptionArgOption): (target: any, propertyKey: string, descriptor: number) => void;
export declare class StructureOption {
}
export declare function Structure(id: string, options?: StructureOption): (target: any) => any;
export declare class FieldOption {
    name?: string;
    substructure?: boolean;
    array?: boolean;
    resolveType?: (value) => FieldType;
}
export declare function Field(type: FieldType | FieldType[], options?: FieldOption): (target: any, propertyKey: string) => void;
export declare class ArgOption {
    nullable?: boolean;
    constr?: boolean;
    array?: boolean;
    resolveType?: (value) => FieldType;
}
export declare function Arg(type: FieldType | FieldType[], name: string, options?: ArgOption): (target: any, propertyKey: string, descriptor: number) => void;
export declare function Constructor(): (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
export declare class InputFieldOption {
    name?: string;
    nullable?: boolean;
    array?: boolean;
    resolveType?: (value) => FieldType;
}
export declare function InputField(type: FieldType | FieldType[], options?: InputFieldOption): (target: any, propertyKey: string) => void;
export declare class InputOption {
}
export declare function Input(id: string, options?: InputOption): (target: any) => void;
