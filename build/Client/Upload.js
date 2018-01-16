"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_link_batch_http_1 = require("apollo-link-batch-http");
const apollo_fetch_1 = require("apollo-fetch");
function createLinkNetwork(opts = {}) {
    return new apollo_link_batch_http_1.BatchHttpLink({
        fetch: createApolloFetchUpload(opts)
    });
}
exports.createLinkNetwork = createLinkNetwork;
;
function createApolloFetchUpload(params = {}) {
    return apollo_fetch_1.createApolloFetch(Object.assign({}, params, { constructOptions: constructUploadOptions }));
}
function constructUploadOptions(requestOrRequests, options) {
    const formData = new FormData();
    let hasFiles = false;
    if (Array.isArray(requestOrRequests)) {
        for (let request of requestOrRequests) {
            if (collectFiles(formData, request.variables)) {
                hasFiles = true;
            }
        }
    }
    else {
        if (collectFiles(formData, requestOrRequests.variables)) {
            hasFiles = true;
        }
    }
    if (hasFiles) {
        if (typeof FormData === 'undefined') {
            throw new Error('Environment must support FormData to upload files.');
        }
        options.method = 'POST';
        options.body = formData;
        options.body.append('operations', JSON.stringify(requestOrRequests));
        // files.forEach(({ path, file }) => options.body.append(path, file));
        return options;
    }
    return apollo_fetch_1.constructDefaultOptions(requestOrRequests, options);
}
function collectFiles(formData, object) {
    let hasFile = false;
    for (let [name, node] of Object.entries(object)) {
        if (node instanceof File) {
            hasFile = true;
            const id = Math.random().toString(36);
            formData.append(id, node);
            object[name] = id;
        }
        else if (node instanceof Object) {
            hasFile = collectFiles(formData, node) ? true : hasFile;
        }
    }
    return hasFile;
}
//# sourceMappingURL=Upload.js.map