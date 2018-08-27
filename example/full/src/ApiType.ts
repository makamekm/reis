/* tslint:disable */

export type Date = any;

export type UserRule = any;

export type Language = any;

export type Username = any;

export type Email = any;

export type Password = any;

export type Upload = any;

export interface RootQuery {
  user?: UserQuery | null;
}

export interface UserQuery {
  list?: UserListResult | null;
  me?: User | null;
}

export interface UserListResult {
  users?: (User | null)[] | null;
  count?: number | null;
}

export interface User {
  id?: string | null;
  email?: string | null;
  username?: string | null;
  date?: Date | null;
  dateOfBirth?: Date | null;
  avatar?: string | null;
  rules?: (UserRule | null)[] | null;
  language?: Language | null;
}

export interface RootMutation {
  auth?: Auth | null;
  user?: UserEditMutation | null;
}

export interface Auth {
  login?: Session | null;
  registration?: User | null;
  check?: Session | null;
  logout?: boolean | null;
  touch?: Session | null;
}

export interface Session {
  sid?: string | null;
  user?: User | null;
  token?: string | null;
}

export interface UserEditMutation {
  delete?: boolean | null;
  create?: User | null;
  edit?: User | null;
  editMe?: User | null;
}

export interface UserFilter {
  username?: string | null;
  rules?: (number | null)[] | null;
  language?: (number | null)[] | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  email?: string | null;
}

export interface UserOrder {
  name: UserOrderEnum;
  type: OrderEnum;
}

export interface AuthRegistration {
  username: Username;
  password: Password;
  email?: Email | null;
  avatar?: Upload | null;
}

export interface UserEditDate {
  username: Username;
  password?: Password | null;
  email?: Email | null;
  avatar?: Upload | null;
  language?: Language | null;
  rules?: UserRule[] | null;
}

export interface UserEditMeDate {
  username: Username;
  password?: Password | null;
  email?: Email | null;
  avatar?: Upload | null;
  language?: Language | null;
}
export interface ListUserQueryArgs {
  filter: UserFilter;
  order?: (UserOrder | null)[] | null;
  limit?: number | null;
  offset?: number | null;
}
export interface LoginAuthArgs {
  login?: string | null;
  username?: Username | null;
  email?: Email | null;
  password: Password;
}
export interface RegistrationAuthArgs {
  data: AuthRegistration;
}
export interface DeleteUserEditMutationArgs {
  ids?: string[] | null;
}
export interface CreateUserEditMutationArgs {
  data: UserEditDate;
}
export interface EditUserEditMutationArgs {
  id: string;
  data: UserEditDate;
}
export interface EditMeUserEditMutationArgs {
  data: UserEditMeDate;
}

export enum UserOrderEnum {
  username = "username",
  date = "date",
  email = "email",
  language = "language"
}

export enum OrderEnum {
  desc = "desc",
  asc = "asc"
}
export namespace UsersDelete {
  export type Variables = {
    ids: string[];
  };

  export type Mutation = {
    __typename?: "Mutation";
    user?: User | null;
  };

  export type User = {
    __typename?: "UserEditMutation";
    delete?: boolean | null;
  };
}
export namespace UserEditMe {
  export type Variables = {
    username: Username;
    password?: Password | null;
    email?: Email | null;
    avatar?: Upload | null;
    language?: Language | null;
  };

  export type Mutation = {
    __typename?: "Mutation";
    user?: User | null;
  };

  export type User = {
    __typename?: "UserEditMutation";
    editMe?: EditMe | null;
  };

  export type EditMe = {
    __typename?: "User";
    id?: string | null;
    avatar?: string | null;
    username?: string | null;
    email?: string | null;
    rules?: (UserRule | null)[] | null;
    language?: Language | null;
  };
}
export namespace Users {
  export type Variables = {
    filter: UserFilter;
    order?: (UserOrder | null)[] | null;
    limit?: number | null;
    offset?: number | null;
  };

  export type Query = {
    __typename?: "Query";
    user?: User | null;
  };

  export type User = {
    __typename?: "UserQuery";
    list?: List | null;
  };

  export type List = {
    __typename?: "UserListResult";
    users?: (Users | null)[] | null;
    count?: number | null;
  };

  export type Users = {
    __typename?: "User";
    id?: string | null;
    username?: string | null;
    rules?: (UserRule | null)[] | null;
    email?: string | null;
    language?: Language | null;
    avatar?: string | null;
  };
}
export namespace UsersList {
  export type Variables = {
    filter: UserFilter;
    order?: (UserOrder | null)[] | null;
    limit?: number | null;
    offset?: number | null;
  };

  export type Query = {
    __typename?: "Query";
    user?: User | null;
  };

  export type User = {
    __typename?: "UserQuery";
    list?: List | null;
  };

  export type List = {
    __typename?: "UserListResult";
    users?: (Users | null)[] | null;
  };

  export type Users = {
    __typename?: "User";
    id?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
}
export namespace Auth {
  export type Variables = {
    login?: string | null;
    password: Password;
  };

  export type Mutation = {
    __typename?: "Mutation";
    auth?: Auth | null;
  };

  export type Auth = {
    __typename?: "Auth";
    login?: Login | null;
  };

  export type Login = {
    __typename?: "Session";
    sid?: string | null;
    token?: string | null;
    user?: User | null;
  };

  export type User = {
    __typename?: "User";
    id?: string | null;
    username?: string | null;
    email?: string | null;
    avatar?: string | null;
    rules?: (UserRule | null)[] | null;
  };
}
export namespace UserMe {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";
    user?: User | null;
  };

  export type User = {
    __typename?: "UserQuery";
    me?: Me | null;
  };

  export type Me = {
    __typename?: "User";
    id?: string | null;
    avatar?: string | null;
    username?: string | null;
    email?: string | null;
    rules?: (UserRule | null)[] | null;
    language?: Language | null;
  };
}
export namespace Registration {
  export type Variables = {
    username: Username;
    password: Password;
    email?: Email | null;
    avatar?: Upload | null;
  };

  export type Mutation = {
    __typename?: "Mutation";
    auth?: Auth | null;
  };

  export type Auth = {
    __typename?: "Auth";
    registration?: Registration | null;
  };

  export type Registration = {
    __typename?: "User";
    id?: string | null;
  };
}
export namespace Touch {
  export type Variables = {};

  export type Mutation = {
    __typename?: "Mutation";
    auth?: Auth | null;
  };

  export type Auth = {
    __typename?: "Auth";
    touch?: Touch | null;
  };

  export type Touch = {
    __typename?: "Session";
    sid?: string | null;
    token?: string | null;
    user?: User | null;
  };

  export type User = {
    __typename?: "User";
    id?: string | null;
    username?: string | null;
    email?: string | null;
    avatar?: string | null;
    rules?: (UserRule | null)[] | null;
  };
}
