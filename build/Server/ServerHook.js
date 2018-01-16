"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let hooksGraphQL = [];
exports.getHooksGraphQL = () => hooksGraphQL;
let hooksWSonConnect = [];
exports.getHooksWSonConnect = () => hooksWSonConnect;
let hooksWSonMessage = [];
exports.getHooksWSonMessage = () => hooksWSonMessage;
let hooksWSonDisconnect = [];
exports.getHooksWSonDisconnect = () => hooksWSonDisconnect;
exports.RegisterHookGraphQL = () => {
    return (target, key, descriptor) => {
        exports.getHooksGraphQL().push(descriptor.value);
    };
};
exports.RegisterHookWSonConnect = () => {
    return (target, key, descriptor) => {
        exports.getHooksWSonConnect().push(descriptor.value);
    };
};
exports.RegisterHookWSonMessage = () => {
    return (target, key, descriptor) => {
        exports.getHooksWSonMessage().push(descriptor.value);
    };
};
exports.RegisterHookWSonDisconnect = () => {
    return (target, key, descriptor) => {
        exports.getHooksWSonDisconnect().push(descriptor.value);
    };
};
let hooksRender = [];
exports.getHooksRender = () => hooksRender;
exports.RegisterHookRender = () => {
    return (target, key, descriptor) => {
        exports.getHooksRender().push(descriptor.value);
    };
};
let hooksWebHook = [];
exports.getHooksWebHook = () => hooksWebHook;
exports.RegisterHookWebHook = () => {
    return (target, key, descriptor) => {
        exports.getHooksWebHook().push(descriptor.value);
    };
};
//# sourceMappingURL=ServerHook.js.map