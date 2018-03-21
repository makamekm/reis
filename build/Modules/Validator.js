"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringValidator = (value, opts = {
    min: 3,
    max: 20
}) => {
    let errors = [];
    if (!opts.nullable && !value) {
        errors.push("Shouldn't be null");
    }
    else if (opts.nullable && !value) {
        return [];
    }
    else {
        if (typeof value != 'string') {
            errors.push('Is not a string' + value);
        }
        else {
            let reg = RegExp(`^(.{${opts.min},${opts.max}})$`, "i");
            if (!reg.test(value)) {
                errors.push(`Should be betwen ${opts.min} and ${opts.max} chars`);
            }
        }
    }
    return errors;
};
exports.arrayValidator = (value, opts = {
    min: 3,
    max: 20
}) => {
    let errors = [];
    if (!opts.nullable && !value) {
        errors.push("Shouldn't be null");
    }
    else if (opts.nullable && !value) {
        return [];
    }
    else {
        if (!Array.isArray(value)) {
            errors.push('Is not an array' + value);
        }
        else {
            if ((opts.min && value.length < opts.min)) {
                errors.push('Should be > ' + opts.min);
            }
            if ((opts.max && value.length < opts.max)) {
                errors.push('Should be < ' + opts.max);
            }
            let dub = [];
            value.forEach(item => {
                if (opts.type && opts.type == 'number' ? Number.isNaN(item) : typeof item != opts.type) {
                    errors.push('Is not a ' + opts.type + ': ' + item);
                }
                if (opts.validator) {
                    errors.concat(opts.validator(item));
                }
                if (opts.dublicates && typeof opts.dublicates === 'function' && opts.dublicates(item, dub)) {
                    dub.push(item);
                }
                else if (opts.dublicates && typeof opts.dublicates !== 'function' && dub.indexOf(item)) {
                    dub.push(item);
                }
            });
            if (opts.dublicates && dub.length != value.length) {
                errors.push('The array has dublicates');
            }
        }
    }
    return errors;
};
exports.emailValidator = (value, opts = {}) => {
    let errors = [];
    if (!opts.nullable && !value) {
        errors.push("Shouldn't be null");
    }
    else if (opts.nullable && !value) {
        return [];
    }
    else {
        if (typeof value != 'string') {
            errors.push('Is not a string');
        }
        else {
            let reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            if (!reg.test(value)) {
                errors.push('Is not a valid');
            }
        }
    }
    return errors;
};
exports.colorValidator = (value, opts = {}) => {
    let errors = [];
    if (!opts.nullable && !value) {
        errors.push("Shouldn't be null");
    }
    else if (opts.nullable && !value) {
        return [];
    }
    else {
        if (typeof value != 'string') {
            errors.push('Is not a string');
        }
        else {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                errors.push('Should be betwen 3 and 6 chars with HEX style');
            }
        }
    }
    return errors;
};
exports.dateValidator = (value, opts = {}) => {
    let errors = [];
    if (!opts.nullable && !value) {
        errors.push("Shouldn't be null");
    }
    else if (opts.nullable && !value) {
        return [];
    }
    else {
        if (!Date.parse(value)) {
            errors.push('Is not a date: ' + value);
        }
    }
    return errors;
};
exports.configValidator = (value, opts = {
    languages: []
}) => {
    let errors = [];
    if (!value) {
        errors.push("Config shouldn't be null (object)");
    }
    else {
        if (!value.uploadDir || typeof value.uploadDir != 'string') {
            errors.push({ name: 'uploadDir', message: 'Config.uploadDir must be a path (string)' });
        }
        if (value.port == null || value.port == undefined || isNaN(value.port) || value.port < 1) {
            errors.push({ name: 'port', message: 'Config.port must be a number (number)' });
        }
        if (value.port == null || value.port == undefined || isNaN(value.port) || value.portWS < 1) {
            errors.push({ name: 'portWS', message: 'Config.portWS must be > 1 a number (number)' });
        }
        if (value.secretKey == null || value.secretKey == undefined || typeof value.secretKey != 'string' || value.secretKey.length < 3 || value.secretKey.length > 10) {
            errors.push({ name: 'secretKey', message: 'Config.secretKey must be > 1 and <= 10 (string)' });
        }
        if (value.defaultLanguage == null || value.defaultLanguage == undefined || typeof value.defaultLanguage != 'string' || ["en", "ru", "fr"].indexOf(value.defaultLanguage) < 0) {
            errors.push({ name: 'defaultLanguage', message: 'Config.defaultLanguage must be in [' + opts.languages.join(', ') + '] (string)' });
        }
        if (!value.db) {
            errors.push({ name: 'db', message: 'Config.db must be an object (object)' });
        }
        else {
            if (!value.db.Main) {
                errors.push({ name: 'db.Main', message: 'Config.db.Main must be an object (object)' });
            }
            Object.keys(value.db).forEach(name => {
                if (!value.db[name].type || typeof value.db[name].type != 'string' || ["mysql", "sqlite", "mongodb"].indexOf(value.db[name].type) < 0) {
                    errors.push({ name: 'Config.db.' + name + '.type', message: 'Config.db.' + name + '.type must be in [' + ["mysql"].join(', ') + '] (string)' });
                }
                if (value.db[name].host && typeof value.db[name].host != 'string') {
                    errors.push({ name: 'Config.db.' + name + '.host', message: 'Config.db.' + name + '.host must be a string (string)' });
                }
                if (value.db[name].port && (isNaN(value.db[name].port) || value.db[name].port < 1)) {
                    errors.push({ name: 'Config.db.' + name + '.port', message: 'Config.db.' + name + '.port must be a number (number)' });
                }
                if (value.db[name].username && typeof value.db[name].username != 'string') {
                    errors.push({ name: 'Config.db.' + name + '.username', message: 'Config.db.' + name + '.username must be a string (string)' });
                }
                if (value.db[name].password && typeof value.db[name].password != 'string') {
                    errors.push({ name: 'Config.db.' + name + '.password', message: 'Config.db.' + name + '.password must be a string (string)' });
                }
                if (value.db[name].database == null || value.db[name].database == undefined || typeof value.db[name].database != 'string') {
                    errors.push({ name: 'Config.db.' + name + '.database', message: 'Config.db.' + name + '.database must be a string (string)' });
                }
                if (value.db[name].storage && typeof value.db[name].storage != 'string') {
                    errors.push({ name: 'Config.db.' + name + '.storage', message: 'Config.db.' + name + '.storage must be a string (string)' });
                }
            });
        }
    }
    return errors;
};
// export const dateValidator = (value: any, opts: {
//   nullable?: boolean
// } = {
// }): string[]  => {
//   let errors = [];
//   if (moment.isMoment(value) ) { return value }
//   else {
//     throw new GraphQL.GraphQLError(`${value} is not a valid date`);
//   }
// }
//# sourceMappingURL=Validator.js.map