import * as Redux from 'redux';

import * as Reducer from 'reiso/Modules/Reducer';

export interface ConnectProps {
  notify?:(data: NotificationModel) => void
}

export const Connect = Reducer.Connect<{}, ConnectProps, StateModel>(state => ({}), (dispatch, props) => ({
  notify(data: NotificationModel) {
    dispatch(setNotification(data));
  }
}))

export interface NotificationModel {
  id?: any
  title?: string
  code?: string
  type: "error" | "info"
  message: string
}

export interface Model {
  title: string
  notifications: NotificationModel[]
  theme: 'dark' | 'light'
}

export interface StateModel {
  Header: Model
}

const initialState: Model = {
  title: 'Crypto Board',
  notifications: [],
  theme: 'dark'
};

export type Types = 'SET_TITLE' | 'SET_NOTIFFICATION' | 'UNSET_NOTIFFICATION' | 'SET_INVERTED' | 'SET_THEME'

export interface Action extends Redux.Action {
  type: Types,
  title?: string,
  notification?: NotificationModel
  theme?: Model['theme']
}

export function setTitle(title: string): Action {
  return {
    type: 'SET_TITLE',
    title
  };
}

export function setTheme(theme: Model['theme']): Action {
  return {
    type: 'SET_THEME',
    theme
  };
}

export function setNotification(notification: NotificationModel): Action {
  if (!notification.id) notification.id = Math.random();

  return {
    type: 'SET_NOTIFFICATION',
    notification
  };
}

export function unsetNotification(notification: NotificationModel): Action {
  return {
    type: 'UNSET_NOTIFFICATION',
    notification
  };
}

Reducer.Reducer('Header', (state: Model = initialState, action: Action): Model => {
  switch (action.type) {

    case 'SET_TITLE':
      return {
        ...state,
        title: action.title
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.theme
      };

    case 'SET_NOTIFFICATION':
      if (state.notifications.findIndex(i => i.id == action.notification.id) < 0) {
        var notifications = [];
        state.notifications.forEach(n => notifications.push(n));
        notifications.push(action.notification);
        return {
          ...state,
          notifications: notifications
        };
      }
      return state;

    case 'UNSET_NOTIFFICATION':
      var notifications = [];
      state.notifications.forEach(n => {
        if (n !== action.notification) notifications.push(n);
      });
      return {
        ...state,
        notifications: notifications
      };

    default:
      return state;
  }
})