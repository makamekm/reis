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
    quota: number | ((args: any[], context) => number)
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
    quota: number | ((args: any[], context) => number)

    args: { [name: string]: ModelArg; } = {}
}

export class Model {
    id: string
    target: any = null
    quotaConstr: number | ((args: any[], context) => number)

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

export class MutationOption {
    name: string
}

export class SubscriptionOption {
    name?: string
    array?: boolean = false
    resolveType?: (value) => FieldType
    scope?: string
    quota?: number | ((args: any[], context) => number)
}

export class SubscriptionArgOption {
    nullable?: boolean = true
    constr?: boolean = false
    array?: boolean = false
    resolveType?: (value) => FieldType
}

export class StructureOption {
    quotaConstr?: number | ((args: any[], context) => number)
}

export class FieldOption {
    name?: string
    quota?: number | ((args: any[], context) => number)
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

export class ConstructorOption {
    quota?: number | ((args: any[], context) => number)
}