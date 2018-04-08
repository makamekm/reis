import * as Translation from 'reiso/Modules/Translation';
import { RegisterHook } from 'reiso/Modules/ClientHook';

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }

  return null;
}

export class SessionHooker {

  @RegisterHook()
  session(store) {
    const connectionParams: {
      session_id?: string,
      session_token?: string
      language?: string
    } = {};

    if (getCookie('session_id') && getCookie('session_token')) {
      connectionParams.session_id = getCookie('session_id');
      connectionParams.session_token = getCookie('session_token');
    }

    let authContext: {
      session_id?: string,
      session_token?: string
    } = {};

    if (getCookie('session_id') && getCookie('session_token')) {
      authContext.session_id = getCookie('session_id');
      authContext.session_token = getCookie('session_token');
    }

    const AuthLink: any = (operation, forward) => {
      const token = store.getState().authToken;

      operation.setContext(context => ({
        ...context,
        headers: {
          ...context.headers,
          ...authContext
        },
      }));

      return forward(operation);
    };

    return {
      connectionParams,
      linksBefore: [
        AuthLink
      ],
      linksAfter: []
    }
  }
}