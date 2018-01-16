import * as ApolloLink from "apollo-link";

let hooks: ((store) => {
  connectionParams?: any,
  linksBefore?: ApolloLink.ApolloLink[]
  linksAfter?: ApolloLink.ApolloLink[]
  linksWrap?: ApolloLink.ApolloLink
})[] = [];

export const getHooks: any = () => hooks;

export function RegisterHook() {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(store) => Promise<object> | object>): any => {
    hooks.push(descriptor.value as any);
  }
}