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

let hooksRender: ((req, res, next, language, store) => (Promise<any> | any))[] = [];
export const getHooksRender = () => hooksRender;
export function RegisterHookRender(func: (req, res, next, language, store) => (Promise<any> | any)) {
  getHooksRender().push(func);
}

let hooksWebHook: ((req: express.Request, res: express.Response, next: express.NextFunction, language: string, context) => (Promise<any> | any))[] = [];
export const getHooksWebHook = () => hooksWebHook;
export function RegisterHookWebHook(func: (req: express.Request, res: express.Response, next: express.NextFunction, language: string, context) => (Promise<any> | any)) {
  getHooksWebHook().push(func);
}

let hooksAfterServerStart: (() => (Promise<any> | any))[] = [];
export const getHooksAfterServerStart = () => hooksAfterServerStart;
export function RegisterHookAfterServerStart(func: () => (Promise<any> | any)) {
  getHooksAfterServerStart().push(func);
}