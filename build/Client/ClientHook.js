"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let hooks = [];
exports.getHooks = () => hooks;
function RegisterHook() {
    return (target, key, descriptor) => {
        hooks.push(descriptor.value);
    };
}
exports.RegisterHook = RegisterHook;
//# sourceMappingURL=ClientHook.js.map