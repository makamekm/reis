"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let hooksRouter = [];
exports.getHooksRouter = () => hooksRouter;
exports.RegisterHookRouter = () => {
    return (target, key, descriptor) => {
        exports.getHooksRouter().push(descriptor.value);
    };
};
//# sourceMappingURL=BothHook.js.map