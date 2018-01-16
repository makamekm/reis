import * as express from 'express';

let hooksGraphQL: ((req, context) => (Promise<void> | void))[] = [];
export const getHooksGraphQL = () => hooksGraphQL;
let hooksWSonConnect: ((connectionParams, webSocket, connectionContext) => (Promise<void> | void))[] = [];
export const getHooksWSonConnect = () => hooksWSonConnect;
let hooksWSonMessage: ((message, params, webSocket) => (Promise<void> | void))[] = [];
export const getHooksWSonMessage = () => hooksWSonMessage;
let hooksWSonDisconnect: ((webSocket) => (Promise<void> | void))[] = [];
export const getHooksWSonDisconnect = () => hooksWSonDisconnect;

export const RegisterHookGraphQL: any = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(req, context) => Promise<object> | object>): any => {
    getHooksGraphQL().push(descriptor.value as any);
  }
}

export const RegisterHookWSonConnect: any = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(connectionParams, webSocket, connectionContext) => Promise<object> | object>): any => {
    getHooksWSonConnect().push(descriptor.value as any);
  }
}

export const RegisterHookWSonMessage: any = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(message, params, webSocket) => Promise<object> | object>): any => {
    getHooksWSonMessage().push(descriptor.value as any);
  }
}

export const RegisterHookWSonDisconnect: any = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(message, params, webSocket) => Promise<object> | object>): any => {
    getHooksWSonDisconnect().push(descriptor.value as any);
  }
}

let hooksRender: ((req, res, next, language, store) => (Promise<any> | any))[] = [];
export const getHooksRender = () => hooksRender;

export let RegisterHookRender = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(req, res, next, _language, store) => Promise<any> | object>): any => {
    getHooksRender().push(descriptor.value as any);
  }
}

let hooksWebHook: ((req: express.Request, res: express.Response, next: express.NextFunction, language: string, context) => (Promise<any> | any))[] = [];
export const getHooksWebHook = () => hooksWebHook;

export let RegisterHookWebHook = () => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(req: express.Request, res: express.Response, next: express.NextFunction, language: string, context) => Promise<any> | object>): any => {
    getHooksWebHook().push(descriptor.value as any);
  }
}