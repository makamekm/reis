import { getConfig } from '../../Modules/Config';
import * as Log from '../../Modules/Log';

export function genMessage(state) {
    let messages = [];
    for (let i in state) {
        messages = messages.concat(i + ': ' + state[i]);
    }
    return messages.join('; ');
}
  
export function parseAndLogError(error, type = 'graphql', request, response) {
    let original = error.originalError || error;
    let message = error.message || original.message || (original.state && genMessage(original.state)) || (error.state && genMessage(error.state));

    let serialazed = {
        status: original.status,
        type: error.type ? error.type : (original.constructor.name),
        state: original.state,
        message: error.message,
        title: original.title,
        code: original.code,
        path: original.path,
        errors: error.graphQLErrors ? error.graphQLErrors.map(e => parseAndLogError(e, type, request, response)) : []
    };

    if (process.env.NODE_ENV == 'development') {
        serialazed['locations'] = error.locations;
        serialazed['trace'] = error.trace ? error.trace : error.stack;
    }

    if (!original.message && !!message) {
        original.message = message;
    }

    Log.logError(original, { typeRes: type, errorType: original.constructor.name, request, response, message, type: error.type ? error.type : (original.constructor.name) });

    return serialazed;
}