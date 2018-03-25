import { ApolloLink, Operation, FetchResult, Observable, NextLink } from 'apollo-link';
export declare class UploadLink extends ApolloLink {
    constructor(options: any);
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
}
