/// <reference types="express" />
import * as express from 'express';
export declare const getHooksGraphQL: () => ((req: any, context: any) => void | Promise<void>)[];
export declare const getHooksWSonConnect: () => ((connectionParams: any, webSocket: any, connectionContext: any) => void | Promise<void>)[];
export declare const getHooksWSonMessage: () => ((message: any, params: any, webSocket: any) => void | Promise<void>)[];
export declare const getHooksWSonDisconnect: () => ((webSocket: any) => void | Promise<void>)[];
export declare const RegisterHookGraphQL: any;
export declare const RegisterHookWSonConnect: any;
export declare const RegisterHookWSonMessage: any;
export declare const RegisterHookWSonDisconnect: any;
export declare const getHooksRender: () => ((req: any, res: any, next: any, language: any, store: any) => any)[];
export declare let RegisterHookRender: () => (target: any, key: string, descriptor: TypedPropertyDescriptor<(req: any, res: any, next: any, _language: any, store: any) => object | Promise<any>>) => any;
export declare const getHooksWebHook: () => ((req: express.Request, res: express.Response, next: express.NextFunction, language: string, context: any) => any)[];
export declare let RegisterHookWebHook: () => (target: any, key: string, descriptor: TypedPropertyDescriptor<(req: express.Request, res: express.Response, next: express.NextFunction, language: string, context: any) => object | Promise<any>>) => any;
