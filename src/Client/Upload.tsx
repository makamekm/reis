import * as ApolloClient from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { ApolloLink, Operation, FetchResult, Observable, NextLink } from 'apollo-link';

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
      formData.append(id, node);
      object[name] = id;
    } else if (node instanceof Object) {
      hasFile = collectFiles(formData, node) ? true : hasFile;
    }
  }

  return hasFile;
}

export class UploadLink extends ApolloLink {
  constructor(options: any) {
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
        body
      }));
    }

    operation.setContext(({ headers }) => {
      console.log(headers);
      
      return {}
    });

    // operation.setContext(({ headers }) => ({
    //   headers: {
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