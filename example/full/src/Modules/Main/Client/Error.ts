import { onError } from "apollo-link-error";

import { RegisterHook } from 'reiso/Modules/ClientHook';

import * as Header from '../Reducer/Header';

export class SessionHooker {

  @RegisterHook()
  error(store) {

    const linkError = onError(({ graphQLErrors, networkError, operation }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          );

          store.dispatch(Header.setNotification({
            id: 'GraphQLError',
            title: operation.operationName ? `Server has sended an error: ${operation.operationName}` : `Server has sended an error`,
            message: `Message: ${message}`,
            type: 'error'
          }));
        });
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        store.dispatch(Header.setNotification({
          id: 'NetworkError',
          title: operation.operationName ? `Network error: ${operation.operationName}` : `Network error`,
          message: networkError.message,
          type: 'error'
        }));
      }
    });

    return {
      linkWrap: linkError
    }
  }
}