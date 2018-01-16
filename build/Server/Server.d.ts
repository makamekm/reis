/// <reference types="express" />
/// <reference types="node" />
import * as express from 'express';
import * as http from 'http';
export declare function parseError(error: any, type?: string): {
    status: any;
    type: any;
    state: any;
    message: any;
    path: any;
    errors: any;
};
export declare class Server {
    app: express.Express;
    server: http.Server;
    private api;
    private webpackHotMiddleware;
    private dirPath;
    private subscriptionManager;
    constructor(dirPath?: string);
    test(): Promise<void>;
    start(): Promise<void>;
    config(): void;
    setSubscription(): void;
    private logErrors(error, req, res, next);
    setRender(): void;
    setFileUpload(): void;
    setWebHook(): void;
    setGraphQL(): void;
    run(): void;
}
