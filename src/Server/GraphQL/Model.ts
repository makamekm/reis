export type FieldType = Function | 'string' | 'integer' | 'boolean' | 'float' | 'id';

export const inputMetadataKey = Symbol('__graphql_input');
export const subMetadataKey = Symbol('__graphql_sub');
export const typeMetadataKey = Symbol('__graphql_type');

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

    fields: { [name: string]: ModelField; } = {};
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

export class QueryOption {
    name: string
}

export class MutationOption {
    name: string
}

export class SubscriptionOption {
    name?: string
    array?: boolean = false
    resolveType?: (value) => FieldType
    scope?: string
}

export class SubscriptionArgOption {
    nullable?: boolean = true
    constr?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export class StructureOption {
}

export class FieldOption {
    name?: string
    substructure?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export class ArgOption {
    nullable?: boolean = true
    constr?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export class InputFieldOption {
    name?: string
    nullable?: boolean = true
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export class InputOption {
}