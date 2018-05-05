import * as ApolloLink from "apollo-link";

let hooks: ((store) => {
  connectionParams?: any,
  linksBefore?: ApolloLink.ApolloLink[]
  linksAfter?: ApolloLink.ApolloLink[]
  linksWrap?: ApolloLink.ApolloLink
})[] = [];

export const getHooks: any = () => hooks;

export function RegisterHook(func) {
  hooks.push(func);
}