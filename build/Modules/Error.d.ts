import * as graphql from 'graphql';
export declare class PureError extends Error {
    name: string;
    constructor(name: string, message: any);
}
export declare class BaseError extends PureError {
    name: string;
    status: number;
    constructor(name: string, message: any, status?: number);
}
export declare class UnexpectedInput extends BaseError {
    message: string;
    constructor(message: string);
}
export declare class MissMatchError extends BaseError {
    message: string;
    constructor(message: string);
}
export declare class FileFormat extends BaseError {
    message: string;
    constructor(message: string);
}
export declare class DenyError extends BaseError {
    message: string;
    constructor(message: string);
}
export declare class ValidationError extends graphql.GraphQLError {
    status: number;
    state: {
        [key: string]: string[];
    };
    constructor(errors: {
        key: string;
        message: string;
    }[]);
}
