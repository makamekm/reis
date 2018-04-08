import * as Arena from 'bull-arena';

import * as Translation from 'reiso/Modules/Translation';
import * as Handler from 'reiso/Modules/Handler';
import { RegisterHookGraphQL, RegisterHookWSonConnect, RegisterHookWSonMessage, RegisterHookRender, RegisterHookWebHook } from 'reiso/Modules/ServerHook';

import { SessionStore } from '../Service/Session';
import { User } from '../Entity/User';
import { Session } from '../Entity/Session';
import * as UserReducer from '../Reducer/User';
import { AdminRule, HasAdminRule } from '../Enum/AdminRule';

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

export class SessionHooker {

  @RegisterHookGraphQL()
  async sessionGraphQL(req, context) {
    let session = null;

    if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
      let session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));
      if (session) context.session = session;
    }

    if (!context.session && req.headers.session_id && req.headers.session_token) {
      let session = await SessionStore.get(req.headers.session_id, req.headers.session_token);
      if (session) context.session = session;
    }

    if (context.session && context.session.user) {
      context.language = context.session.user.getLanguageCode();
      context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);
    }
  }

  @RegisterHookWSonConnect()
  async sessionwsOnConnect(connectionParams, webSocket, connectionContext) {
    if (connectionParams.session_id && connectionParams.session_token) {
      connectionContext.socket.upgradeReq.headers.session_id = connectionParams.session_id;
      connectionContext.socket.upgradeReq.headers.session_token = connectionParams.session_token;
    }
  }

  @RegisterHookWSonMessage()
  async sessionwsOnMessage(message, params, webSocket) {
    if (webSocket.upgradeReq.headers.session_id && webSocket.upgradeReq.headers.session_token) {
      let session = await SessionStore.get(webSocket.upgradeReq.headers.session_id, webSocket.upgradeReq.headers.session_token);

      if (session) {
        params.context.session = session;

        if (session.user) {
          params.context.language = session.user.getLanguageCode();;
          params.context.trans = (query: string, ...args): string => Translation.trans(params.context.language, query, ...args);
        }
      }
    }
  }

  @RegisterHookRender()
  async session(req, res, next, _language, store) {
    let user: User;

    let language = _language;

    if (!language) {
      language = Translation.getLanguage();
    }

    if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
      try {
        let session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));

        if (session) {
          user = session.user;
        }
      }
      catch (e) {
      }
    }

    if (!language && user) {
      language = user.getLanguageCode();
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

    const AuthLink: any = (operation, forward) => {
      const token = store.getState().authToken;

      operation.setContext(context => ({
        ...context,
        headers: {
          ...context.headers,
          ...authContext,
          language
        },
      }));

      return forward(operation);
    };

    if (user) {
      (store.dispatch as any)(UserReducer.setUser({
        id: user.id,
        username: user.username,
        email: user.email && user.email.name,
        avatar: user.avatar && user.avatar.thumb,
        rules: user.rules
      }));
    }

    if (req.path.indexOf('/admin/worker') == 0) {
      if (user && HasAdminRule(user.rules, [AdminRule.Administator])) {
        arena(req, res, next);
        return;
      }
    }

    return {
      language,
      linksBefore: [
        AuthLink
      ],
      linksAfter: []
    }
  }

  @RegisterHookWebHook()
  async sessionWebHook(req, res, next, _language, context) {
    let session: Session;

    let language = _language;

    if (!language) {
      language = Translation.getLanguage();
    }

    if (getCookie(req.headers.cookie, 'session_id') && getCookie(req.headers.cookie, 'session_token')) {
      try {
        session = await SessionStore.get(getCookie(req.headers.cookie, 'session_id'), getCookie(req.headers.cookie, 'session_token'));
      }
      catch (e) {
      }
    }

    context.session = session;

    if (!language && session && session.user) {
      language = session.user.getLanguageCode();
    }

    return {
      language
    }
  }
}