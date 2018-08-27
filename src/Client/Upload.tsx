import * as ApolloClient from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { ApolloLink, Operation, FetchResult, Observable, NextLink } from 'apollo-link';
import {
  selectURI,
  selectHttpOptionsAndBody,
  fallbackHttpConfig,
  serializeFetchParameter,
  createSignalIfSupported,
  parseAndCheckHttpResponse
} from 'apollo-link-http-common'

import {
  constructDefaultOptions,
  createApolloFetch,
  ApolloFetch,
  FetchOptions,
  GraphQLRequest,
} from 'apollo-fetch';

function collectFiles(formData: FormData, object: Object): boolean {
  let hasFile = false;

  for (let [name, node] of Object.entries(object)) {
    if (node instanceof File) {
      hasFile = true;
      const id = Math.random().toString(36);
      formData.append(id, node, node.name);
      object[name] = id;
    } else if (node instanceof Object) {
      hasFile = collectFiles(formData, node) ? true : hasFile;
    }
  }

  return hasFile;
}

export class UploadLink extends ApolloLink {
  constructor() {
    super();
  }

  request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null {
    const formData = new FormData();
    let hasFiles = false;

    if (collectFiles(formData, operation.variables)) {
      hasFiles = true;
    }

    if (hasFiles) {
      if (typeof FormData === 'undefined') {
        throw new Error('Environment must support FormData to upload files.');
      }

      let body = formData;
      body.append('operations', JSON.stringify(operation));

      // files.forEach(({ path, file }) => options.body.append(path, file));

      // return options;

      operation.setContext(({ headers }) => ({
        method: 'POST',
        body,
        headers: {
          ...headers,
          // Accept: '*/*'
          'content-type': 'multipart/form-data'
        }
      }));
    }

    // operation.setContext(({ headers }) => ({
    //   method: 'POST',
    //   headers: {
    //     'content-type': 'application/graphql'
    //   }
    // }));

    return forward(operation);
  }
}

// export function createLinkNetwork(opts: FetchOptions = {}) {
//   return new BatchHttpLink({
//     fetch: createApolloFetchUpload(opts)
//   });
// };

// function createApolloFetchUpload(params: FetchOptions = {}): ApolloFetch {
//   return createApolloFetch({
//     ...params,
//     constructOptions: constructUploadOptions,
//   });
// }

// function constructUploadOptions(
//   requestOrRequests: GraphQLRequest | GraphQLRequest[],
//   options: RequestInit,
// ): RequestInit {

//   const formData = new FormData();
//   let hasFiles = false;

//   if (Array.isArray(requestOrRequests)) {
//     for (let request of requestOrRequests) {
//       if (collectFiles(formData, request.variables)) {
//         hasFiles = true;
//       }
//     }
//   } else {
//     if (collectFiles(formData, requestOrRequests.variables)) {
//       hasFiles = true;
//     }
//   }

//   if (hasFiles) {
//     if (typeof FormData === 'undefined') {
//       throw new Error('Environment must support FormData to upload files.');
//     }

//     options.method = 'POST';
//     options.body = formData;
//     options.body.append('operations', JSON.stringify(requestOrRequests));
//     // files.forEach(({ path, file }) => options.body.append(path, file));

//     return options;
//   }

//   return constructDefaultOptions(requestOrRequests, options);
// }


export const createUploadLink = ({
  uri: fetchUri = '/graphql',
  fetch: linkFetch = fetch,
  // fetchOptions,
  // credentials,
  // headers,
  // includeExtensions
} = {}) => {
  const linkConfig = {
    http: { includeExtensions: null },
    options: null,
    credentials: null,
    headers: null
  }

  return new ApolloLink(operation => {
    const uri = selectURI(operation, fetchUri)
    const context = operation.getContext()
    const contextConfig = {
      http: context.http,
      options: context.fetchOptions,
      credentials: context.credentials,
      headers: context.headers
    }

    const { options, body } = selectHttpOptionsAndBody(
      operation,
      fallbackHttpConfig,
      linkConfig,
      contextConfig
    )
    
    const formData = new FormData();
    let hasFiles = false;

    if (collectFiles(formData, body.variables)) {
      hasFiles = true;
    }

    const payload = serializeFetchParameter(body, 'Payload')

    if (hasFiles) {
      // Automatically set by fetch when the body is a FormData instance.
      delete options.headers['content-type']

      // GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec
      options.body = formData
      options.body.append('operations', payload)
    } else options.body = payload

    return new Observable(observer => {
      // Allow aborting fetch, if supported.
      const { controller, signal } = createSignalIfSupported()
      if (controller) options.signal = signal

      linkFetch(uri, options)
        .then(response => {
          // Forward the response on the context.
          operation.setContext({ response })
          return response
        })
        .then(parseAndCheckHttpResponse(operation))
        .then(result => {
          observer.next(result)
          observer.complete()
        })
        .catch(error => {
          if (error.name === 'AbortError')
            // Fetch was aborted.
            return

          if (error.result && error.result.errors && error.result.data)
            // There is a GraphQL result to forward.
            observer.next(error.result)

          observer.error(error)
        })

      // Cleanup function.
      return () => {
        // Abort fetch.
        if (controller) controller.abort()
      }
    })
  })
}