import { RegisterHookRouter } from 'reiso/Modules/BothHook';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';

RegisterHookRouter(data => {
  data.user = UserReducer.ConvertConnectUser(data.store.getState())
})