"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const basicAuth = require("basic-auth");
const Translation = require("../Modules/Translation");
const Log = require("../Modules/Log");
const ServerHook_1 = require("../Modules/ServerHook");
exports.webHooks = [];
function RegisterWebHook(opt) {
    return (target, key, descriptor) => {
        exports.webHooks.push({
            path: opt.path,
            func: descriptor.value,
            auth: opt.auth,
            isAuth: opt.isAuth
        });
    };
}
exports.RegisterWebHook = RegisterWebHook;
exports.hook = (webHook, req, res, next, _language) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let language = _language;
    const hooksRes = [];
    const context = { files: req.files };
    for (let hook of ServerHook_1.getHooksWebHook()) {
        let hookR = yield hook(req, res, next, language, context);
        if (!hookR)
            return;
        if (!language && hookR.language) {
            language = hookR.language;
        }
        hooksRes.push(hookR);
    }
    if (!language) {
        language = Translation.getLanguage();
    }
    context.language = language;
    context.trans = (query, ...args) => Translation.trans(context.language, query, ...args);
    let isAuth = true;
    if (webHook.isAuth) {
        isAuth = yield webHook.isAuth(req.params, req.body, context);
    }
    if (isAuth && webHook.auth) {
        let auth = basicAuth(req);
        if (!auth) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.send(401);
        }
        else {
            let result = yield webHook.auth(auth.name, auth.pass, req.params, req.body, context);
            if (!result) {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.send(401);
            }
        }
    }
    try {
        const body = yield webHook.func(req.params, req.body, context);
        res.status(200);
        res.jsonp(body);
    }
    catch (e) {
        res.status(501);
        res.send(e.message);
        Log.fixError(e, 'serverWebHook');
    }
});
//# sourceMappingURL=WebHook.js.map