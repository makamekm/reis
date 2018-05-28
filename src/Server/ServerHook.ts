import * as express from 'express';

let hooksGraphQL: ((req, context) => (Promise<void> | void))[] = [];
export const getHooksGraphQL = () => hooksGraphQL;
export function RegisterHookGraphQL(func: (req, context) => (Promise<void> | void)) {
  getHooksGraphQL().push(func as any);
}

let hooksWSonConnect: ((connectionParams, webSocket, connectionContext) => (Promise<void> | void))[] = [];
export const getHooksWSonConnect = () => hooksWSonConnect;
export function RegisterHookWSonConnect(func: (connectionParams, webSocket, connectionContext) => (Promise<void> | void)) {
  getHooksWSonConnect().push(func);
}

let hooksWSonMessage: ((message, params, webSocket) => (Promise<void> | void))[] = [];
export const getHooksWSonMessage = () => hooksWSonMessage;
export function RegisterHookWSonMessage(func: (message, params, webSocket) => (Promise<void> | void)) {
  getHooksWSonMessage().push(func);
}

let hooksWSonDisconnect: ((webSocket) => (Promise<void> | void))[] = [];
export const getHooksWSonDisconnect = () => hooksWSonDisconnect;
export function RegisterHookWSonDisconnect(func: (webSocket) => (Promise<void> | void)) {
  getHooksWSonDisconnect().push(func);
}

let hooksRender: ((req, res, next, context, store) => (Promise<void> | void))[] = [];
export const getHooksRender = () => hooksRender;
export function RegisterHookRender(func: (req, res, next, context, store) => (Promise<void> | void)) {
  getHooksRender().push(func);
}

let hooksWebHook: ((req: express.Request, res: express.Response, next: express.NextFunction, context) => (Promise<void> | void))[] = [];
export const getHooksWebHook = () => hooksWebHook;
export function RegisterHookWebHook(func: (req: express.Request, res: express.Response, next: express.NextFunction, context) => (Promise<void> | void)) {
  getHooksWebHook().push(func);
}

let hooksAfterServerStart: (() => (Promise<any> | any))[] = [];
export const getHooksAfterServerStart = () => hooksAfterServerStart;
export function RegisterHookAfterServerStart(func: () => (Promise<any> | any)) {
  getHooksAfterServerStart().push(func);
}

export interface WebHookOption {
  path: string
  isAuth?: (params: { [name: string]: string }, body: any, context) => Promise<boolean> | boolean
  auth?: (username: string, password: string, params: { [name: string]: string }, body: any, context: object) => Promise<boolean> | boolean
}
export type WebHookInterface = WebHookOption & {
  func: (params: { [name: string]: string }, body: any, context: object) => (Promise<object> | object)
}
export const webHooks: WebHookInterface[] = []
export const getWebHooks = () => webHooks;
export function RegisterWebHook(opt: WebHookOption, func: (params: { [name: string]: string }, body: any, context: object) => (Promise<object> | object)) {
  webHooks.push({
    path: opt.path,
    func: func,
    auth: opt.auth,
    isAuth: opt.isAuth
  });
}