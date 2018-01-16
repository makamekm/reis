export declare const stringValidator: (value: any, opts?: {
    min: number;
    max: number;
    nullable?: boolean;
}) => string[];
export declare const arrayValidator: (value: any[], opts?: {
    min?: number;
    max?: number;
    dublicates?: boolean | ((value: any, array: any[]) => boolean);
    type?: string;
    nullable?: boolean;
    validator?: (value: any) => string[];
}) => string[];
export declare const emailValidator: (value: any, opts?: {
    nullable?: boolean;
}) => string[];
export declare const colorValidator: (value: any, opts?: {
    nullable?: boolean;
}) => string[];
export declare const dateValidator: (value: any, opts?: {
    nullable?: boolean;
}) => string[];
export declare const configValidator: (value: any, opts?: {
    languages?: string[];
}) => (string | {
    name: string;
    message: string;
})[];
