import * as Redux from 'redux';

import * as Reducer from 'reiso/Modules/Reducer';

import { UserRule, HasUserRule, UserRuleStringify, UserRuleForEach } from '../Enum/UserRule';

export interface ConnectUserStateInterface {
  user?: ConnectUserInterface
}

export interface ConnectUserInterface {
  entity: UserInterface
  hasRule: (rules: UserRule[]) => boolean
}

export const ConvertConnectUser = (state: StateModel) => ({
  entity: state.User.entity,
  hasRule: (rules: UserRule[]) => state.User.entity && HasUserRule(state.User.entity.rules, rules),
})

export const DecorateConnectUser = Reducer.Connect<ConnectUserStateInterface, any, StateModel>(state => ({
  user: ConvertConnectUser(state)
}))

export interface UserInterface {
  id: any,
  username: string,
  email: string,
  avatar?: string,
  rules: any[]
}

export interface Model {
  entity: UserInterface
}

export interface StateModel {
  User: Model
}

const initialState: Model = {
  entity: null
}

type Types = 'SET_USER' | 'DELETE_USER'

export interface Action extends Redux.Action {
  type: Types,
  user?: UserInterface
}

export function setUser(user: UserInterface): Action|Promise<Action> {
  return {
    type: 'SET_USER',
    user
  }
}

export function deleteUser(id: number): Action|Promise<Action> {
  return {
    type: 'DELETE_USER'
  }
}

Reducer.Reducer('User', (state: Model = initialState, action: Action): Model => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        entity: action.user
      }

    case 'DELETE_USER':
      return {
        ...state,
        entity: null
      }

    default:
      return state
  }
})