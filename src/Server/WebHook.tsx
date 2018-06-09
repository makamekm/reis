import * as express from 'express';
import * as basicAuth from 'basic-auth';

import { getConfig } from '../Modules/Config';
import * as Translation from '../Modules/Translation';
import * as WebHooks from '../Modules/WebHook';
import * as Log from '../Modules/Log';
import { getHooksWebHook, WebHookInterface } from '../Modules/ServerHook';
import { setLanguageContext } from './Lib/Transtalion';

export async function checkHooks(req: express.Request, res: express.Response, next: express.NextFunction, context): Promise<void> {
  for (let hook of getHooksWebHook()) {
    await hook(req, res, next, context)
  }
}

export async function checkAuth(webHook: WebHookInterface, req: express.Request, res: express.Response, context): Promise<boolean> {
  let isAuth = true;

  if (webHook.isAuth) {
    isAuth = await webHook.isAuth(req.params, req.body, context);
  }

  if (isAuth && webHook.auth) {
    let auth = basicAuth(req);

    if (!auth) {
      throw Error('Ckeck auth request. "basic-auth" module does\'nt work');
    } else {
      let result = await webHook.auth(auth.name, auth.pass, req.params, req.body, context);
      if (!result) {
        return false;
      }
    }
  }

  return true;
}

export function prepareLanguage(context) {
  if (!context.language) {
    context.language = Translation.getLanguage();
  }

  context.trans = (query, ...args) => Translation.trans(context.language, query, ...args);
}

export async function hook(webHook: WebHookInterface, req: express.Request, res: express.Response, next: express.NextFunction, language?: string) {
  const context = {
    files: req.files,
    language: language || Translation.getLanguage()
  };

  await checkHooks(req, res, next, context);

  setLanguageContext(context);

  if (!await checkAuth(webHook, req, res, context)) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.send(401);
    return;
  };

  try {
    const body = await webHook.func(req.params, req.body, context);
    res.status(200);
    res.jsonp(body);
  }
  catch (e) {
    res.status(501);
    res.send(e.message);
    Log.logError(e, { type: "webhook" });
  }
}