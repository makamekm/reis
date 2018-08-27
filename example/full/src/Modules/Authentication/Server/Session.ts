import * as Arena from 'bull-arena';

import { getConfig } from 'reiso/Modules/Config';
import * as Log from 'reiso/Modules/Log';
import * as Translation from 'reiso/Modules/Translation';
import * as Handler from 'reiso/Modules/Handler';
import { RegisterHookGraphQL, RegisterHookWSonConnect, RegisterHookWSonMessage, RegisterHookRender, RegisterHookWebHook } from 'reiso/Modules/ServerHook';

import { SessionStore } from '../Service/Session';
import { User } from '../Entity/User';
import { Session } from '../Entity/Session';
import * as UserReducer from '../Reducer/User';
import { UserRule, HasUserRule } from '../Enum/UserRule';

const arena = Arena({
  queues: Handler.getQueuesArena()
}, {
  basePath: '/admin/worker',
  disableListen: true
});

export function getCookie(cookies, name) {
  var value = "; " + cookies;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
  return null;
}

RegisterHookGraphQL(async (req, context) => {
  let session = null;

  if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
    let session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));
    if (session) context.session = session;
  }

  if (!context.session && req.headers.session_id && req.headers.session_token) {
    let session = await SessionStore.get(req.headers.session_id, req.headers.session_token);
    if (session) context.session = session;
  }

  if (context.session && context.session.user && context.session.user.getLanguageCode()) {
    context.language = context.session.user.getLanguageCode();
    context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);

    getConfig().apm && Log.getApm().setUserContext({
      id: context.session.user.id,
      username: context.session.user.username,
      email: context.session.user.email
    });
  }
})

RegisterHookWSonConnect((connectionParams, webSocket, connectionContext) => {
  if (connectionParams.session_id && connectionParams.session_token) {
    connectionContext.socket.upgradeReq.headers.session_id = connectionParams.session_id;
    connectionContext.socket.upgradeReq.headers.session_token = connectionParams.session_token;
  }
})

RegisterHookWSonMessage(async (message, params, webSocket) => {
  if (webSocket.upgradeReq.headers.session_id && webSocket.upgradeReq.headers.session_token) {
    let session = await SessionStore.get(webSocket.upgradeReq.headers.session_id, webSocket.upgradeReq.headers.session_token);

    if (session) {
      params.context.session = session;

      if (session.user && session.user.getLanguageCode()) {
        params.context.language = session.user.getLanguageCode();
        params.context.trans = (query: string, ...args): string => Translation.trans(params.context.language, query, ...args);
      }
    }
  }
})

RegisterHookRender(async (req, res, next, context, store) => {
  let user: User;

  if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
    try {
      let session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));

      if (session) {
        user = session.user;
      }
    } catch (e) {}
  }

  if (!context.language && user && user.getLanguageCode()) {
    context.language = user.getLanguageCode();
  }

  let authContext: {
    session_id?: string,
    session_token?: string
  } = {};

  if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
    authContext.session_id = getCookie(req.headers.cookie, 'session_id');
    authContext.session_token = getCookie(req.headers.cookie, 'session_token');
  }

  if (req.headers.session_id && req.headers.session_token) {
    authContext.session_id = req.headers.session_id;
    authContext.session_token = req.headers.session_token;
  }

  const AuthLink = (operation, forward) => {
    const token = store.getState().authToken;

    operation.setContext(context => ({
      ...context,
      headers: {
        ...context.headers,
        ...authContext,
        language: context.language
      },
    }));

    return forward(operation);
  };

  if (user) {
    store.dispatch(UserReducer.setUser({
      id: user.id,
      username: user.username,
      email: user.email && user.email.name,
      avatar: user.avatar && user.avatar.thumb,
      rules: user.rules
    }));

    getConfig().apm && Log.getApm().setUserContext({
      id: user.id,
      username: user.username,
      email: user.email
    });
  }

  if (req.path.indexOf('/admin/worker') == 0) {
    if (user && HasUserRule(user.rules, [UserRule.Administator])) {
      arena(req, res, next);
      return;
    }
  }

  return {
    linksBefore: [
      AuthLink as any
    ],
    linksAfter: []
  }
})

RegisterHookWebHook(async (req, res, next, context) => {
  let session: Session;

  if (!context.language) {
    context.language = Translation.getLanguage();
  }

  if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
    try {
      session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));
    } catch (e) {}
  }

  context.session = session;

  if (!context.language && session && session.user && session.user.getLanguageCode()) {
    context.language = session.user.getLanguageCode();
  }

  if (session.user) {
    getConfig().apm && Log.getApm().setUserContext({
      id: session.user.id,
      username: session.user.username,
      email: session.user.email
    });
  }
})