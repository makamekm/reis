import { RegisterHookRouter } from 'reiso/Modules/BothHook';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';

export class SessionHooker {

  @RegisterHookRouter()
  session(data) {
    data.user = UserReducer.ConvertConnectUser(data.store.getState())
  }
}