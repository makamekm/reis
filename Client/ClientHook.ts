import * as ApolloLink from "apollo-link";

export type Hook = {
  linksBefore?: ApolloLink.ApolloLink[]
  linksAfter?: ApolloLink.ApolloLink[]
  linksWrap?: ApolloLink.ApolloLink
}
export type Func = (stores, context: {
  language: string
} & any) => {
  linksBefore?: ApolloLink.ApolloLink[]
  linksAfter?: ApolloLink.ApolloLink[]
  linksWrap?: ApolloLink.ApolloLink
}
let hooks: Func[] = [];
export const getHooks: any = () => hooks;
export function RegisterHook(func: Func) {
  hooks.push(func);
}