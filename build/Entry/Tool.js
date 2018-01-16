"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trim(s, c) {
    if (c === "]")
        c = "\\]";
    if (c === "\\")
        c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
}
const Config_1 = require("../Modules/Config");
Config_1.readConfig();
const Config_2 = require("../Modules/Config");
const Validator_1 = require("../Modules/Validator");
let validate = Validator_1.configValidator(Config_1.getConfig(), {
    languages: Config_2.awalableLanguages
});
if (validate.length) {
    throw new Error('Config is not valid: ' + validate.map(e => typeof (e) === 'string' ? e : e.message).join('; ') + ';');
}
const Translation = require("../Modules/Translation");
Translation.setState(Config_1.getConfig().defaultLanguage, Config_1.getConfig().languages, Config_2.translation);
const Tool = require("../Modules/Tool");
const Commander_1 = require("../Server/Commander");
exports.run = () => {
    const commander = new Commander_1.Commander(Tool.commands);
    commander.cycle();
};
//# sourceMappingURL=Tool.js.map