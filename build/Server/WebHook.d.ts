export interface WebHookInterface {
    path: string;
    func: (params: {
        [name: string]: string;
    }, body: any, context: object) => Promise<object> | object;
    auth?: (username: string, password: string, params: {
        [name: string]: string;
    }, body: any, context: object) => Promise<boolean> | boolean;
    isAuth?: (params: {
        [name: string]: string;
    }, body: any, context) => Promise<boolean> | boolean;
}
export declare const webHooks: WebHookInterface[];
export interface WebHookOption {
    path: string;
    isAuth?: (params: {
        [name: string]: string;
    }, body: any, context) => Promise<boolean> | boolean;
    auth?: (username: string, password: string, params: {
        [name: string]: string;
    }, body: any, context: object) => Promise<boolean> | boolean;
}
export declare function RegisterWebHook(opt: WebHookOption): (target: any, key: string, descriptor: TypedPropertyDescriptor<(params: {
    [name: string]: string;
}, body: any, context: any) => object | Promise<object>>) => any;
export declare const hook: any;
