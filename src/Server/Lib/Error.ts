import * as express from 'express';

import * as Log from '../../Modules/Log';

export function genMessage(state: Log.ErrorState): string {
    let messages = [];
    for (let i in state) {
        messages = messages.concat(i + ': ' + state[i].join(', '));
    }
    return messages.join('; ');
}

export type SerializedError = {
    status: string | number
    type: string
    state: Log.ErrorState
    message: string
    originalMessage: string
    title: string
    typeResponse: string
    code: string | number
    path: Object
    errors: SerializedError[]
    locations?: Object
    trace?: Object
}

export function getSerialized(error, type = 'graphql', map: typeof parseAndLogError, request?: express.Request, response?: express.Response): SerializedError {
    let original = error.originalError || error;
    let serialazed: SerializedError = {
        status: original.status,
        type: error.type ? error.type : (original.constructor.name),
        state: original.state,
        message: error.message || original.message,
        originalMessage: original.message,
        typeResponse: type,
        title: original.title,
        code: original.code,
        path: original.path,
        errors: error.graphQLErrors ? error.graphQLErrors.map(e => map(e, type, request, response)) : []
    };

    if (process.env.NODE_ENV == 'development') {
        serialazed.locations = error.locations;
        serialazed.trace = error.trace ? error.trace : error.stack;
    }

    return serialazed;
}

export type ApmAdditional = {
    typeResponse: string
}

export function getApmError(error, type = 'graphql', request?: express.Request, response?: express.Response): [Log.LogError, Log.LogErrorApmAdditional & ApmAdditional] {
    let original = error.originalError || error;
    let message = error.message || original.message || (original.state && genMessage(original.state)) || (error.state && genMessage(error.state));
    if (!original.message && !!message) {
        original.message = message;
    }
    return [
        original,
        {
            typeResponse: type,
            errorType: original.constructor.name,
            request, response, message,
            type: error.type ? error.type : original.constructor.name
        }
    ];
}

export function parseAndLogError(error, type = 'graphql', request?: express.Request, response?: express.Response) {
    const serialazed = getSerialized(error, type, parseAndLogError, request, response);
    const [apmError, apmAdditional] = getApmError(error, type, request, response);
    Log.logError(apmError, apmAdditional);
    return serialazed;
}