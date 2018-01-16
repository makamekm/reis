"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = {};
function RegisterTool(opt) {
    return (target, key, descriptor) => {
        exports.commands[opt.name || key] = {
            description: opt.description,
            action: descriptor.value
        };
    };
}
exports.RegisterTool = RegisterTool;
//# sourceMappingURL=Tool.js.map