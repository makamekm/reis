import { Request as REQ, Response as RES, NextFunction } from 'express';
import * as basicAuth from 'basic-auth';

import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as WebHooks from '../Modules/WebHook';
import * as Log from '../Modules/Log';
import { getHooksWebHook } from '../Modules/ServerHook';

export interface WebHookInterface {
  path: string
  func: (params: { [name: string]: string }, body: any, context: object) => Promise<object> | object
  auth?: (username: string, password: string, params: { [name: string]: string }, body: any, context: object) => Promise<boolean> | boolean
  isAuth?: (params: { [name: string]: string }, body: any, context) => Promise<boolean> | boolean
}

export const webHooks: WebHookInterface[] = []

export interface WebHookOption {
  path: string
  isAuth?: (params: { [name: string]: string }, body: any, context) => Promise<boolean> | boolean
  auth?: (username: string, password: string, params: { [name: string]: string }, body: any, context: object) => Promise<boolean> | boolean
}

export function RegisterWebHook(opt: WebHookOption) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(params: { [name: string]: string }, body: any, context) => Promise<object> | object>): any => {
    webHooks.push({
      path: opt.path,
      func: descriptor.value,
      auth: opt.auth,
      isAuth: opt.isAuth
    });
  }
}

export const hook: any = async (webHook: WebHookInterface, req: REQ, res: RES, next: NextFunction, _language?: string) => {
  let language = _language;

  const hooksRes = [];

  const context: any = { files: req.files };

  for (let hook of getHooksWebHook()) {
    let hookR = await hook(req, res, next, language, context);

    if (!hookR) return;

    if (!language && hookR.language) {
      language = hookR.language
    }

    hooksRes.push(hookR);
  }

  if (!language) {
    language = Translation.getLanguage();
  }

  context.language = language;
  context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);

  let isAuth = true;

  if (webHook.isAuth) {
    isAuth = await webHook.isAuth(req.params, req.body, context);
  }

  if (isAuth && webHook.auth) {
    let auth = basicAuth(req);

    if (!auth) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
    }
    else {
      let result = await webHook.auth(auth.name, auth.pass, req.params, req.body, context);
      if (!result) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(401);
      }
    }
  }

  try {
    const body = await webHook.func(req.params, req.body, context);
    res.status(200);
    res.jsonp(body);
  }
  catch (e) {
    res.status(501);
    res.send(e.message);
    Log.fixError(e, 'serverWebHook');
  }
}