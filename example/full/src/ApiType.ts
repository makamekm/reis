/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface UserFilter {
  username?: string | null,
  rules?: Array< number | null > | null,
  language?: Array< number | null > | null,
  dateFrom?: string | null,
  dateTo?: string | null,
  email?: string | null,
};

export interface UserOrder {
  name: UserOrderEnum,
  type: OrderEnum,
};

export enum UserOrderEnum {
  date = "date",
  email = "email",
  language = "language",
  username = "username",
}


export enum OrderEnum {
  asc = "asc",
  desc = "desc",
}


export interface UsersDeleteMutationVariables {
  ids: Array< string >,
};

export interface UsersDeleteMutation {
  user:  {
    delete: boolean | null,
  } | null,
};

export interface UserEditMeMutationVariables {
  username: string,
  password?: string | null,
  email?: string | null,
  avatar?: string | null,
  language?: string | null,
};

export interface UserEditMeMutation {
  user:  {
    editMe:  {
      id: string | null,
      avatar: string | null,
      username: string | null,
      email: string | null,
      rules: Array< string | null > | null,
      language: string | null,
    } | null,
  } | null,
};

export interface UsersQueryVariables {
  filter: UserFilter,
  order?: Array< UserOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface UsersQuery {
  user:  {
    list:  {
      users:  Array< {
        id: string | null,
        username: string | null,
        rules: Array< string | null > | null,
        email: string | null,
        language: string | null,
        avatar: string | null,
      } | null > | null,
      count: number | null,
    } | null,
  } | null,
};

export interface UsersListQueryVariables {
  filter: UserFilter,
  order?: Array< UserOrder | null > | null,
  limit?: number | null,
  offset?: number | null,
};

export interface UsersListQuery {
  user:  {
    list:  {
      users:  Array< {
        id: string | null,
        username: string | null,
        avatar: string | null,
      } | null > | null,
    } | null,
  } | null,
};

export interface AuthMutationVariables {
  login?: string | null,
  password: string,
};

export interface AuthMutation {
  auth:  {
    login:  {
      sid: string | null,
      token: string | null,
      user:  {
        id: string | null,
        username: string | null,
        email: string | null,
        avatar: string | null,
        rules: Array< string | null > | null,
      } | null,
    } | null,
  } | null,
};

export interface UserMeQuery {
  user:  {
    me:  {
      id: string | null,
      avatar: string | null,
      username: string | null,
      email: string | null,
      rules: Array< string | null > | null,
      language: string | null,
    } | null,
  } | null,
};

export interface RegistrationMutationVariables {
  username: string,
  password: string,
  email?: string | null,
  avatar?: string | null,
};

export interface RegistrationMutation {
  auth:  {
    registration:  {
      id: string | null,
    } | null,
  } | null,
};

export interface TouchMutation {
  auth:  {
    touch:  {
      sid: string | null,
      token: string | null,
      user:  {
        id: string | null,
        username: string | null,
        email: string | null,
        avatar: string | null,
        rules: Array< string | null > | null,
      } | null,
    } | null,
  } | null,
};
