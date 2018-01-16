"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ORM = require("typeorm");
const Entities = {};
class Manager {
    constructor(config) {
        this.conn = {};
        this.connPromises = {};
        this.config = config;
    }
    static addEntity(name, entity) {
        if (Entities[name]) {
            Entities[name].push(entity);
        }
        else {
            Entities[name] = [entity];
        }
    }
    static getEntity(...args) {
        let result = [];
        if (args && args.length > 0) {
            args.forEach(name => {
                result = result.concat(Entities[name]);
            });
        }
        else {
            for (let name in Entities) {
                result = result.concat(Entities[name]);
            }
        }
        return result;
    }
    Connect(name = 'Main') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.conn[name] && !this.connPromises[name]) {
                let resolve = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.conn[name] = yield this.init(this.config[name]);
                    return this.conn[name];
                });
                this.connPromises[name] = resolve();
            }
            yield this.connPromises[name];
            return this.conn[name];
        });
    }
    init(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return ORM.createConnection(config);
        });
    }
    Test() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let name in this.config) {
                let connection = yield this.Connect(name);
            }
        });
    }
    Sync(mode = 'standart') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let name in this.config) {
                let connection = yield this.Connect(name);
                if (mode == 'force') {
                    try {
                        yield connection.synchronize();
                    }
                    catch (e) {
                        yield connection.synchronize(true);
                    }
                }
                else if (mode == 'passive') {
                    try {
                        yield connection.synchronize();
                    }
                    catch (e) { }
                }
                else if (mode == 'standart') {
                    yield connection.synchronize();
                }
            }
        });
    }
    Drop() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let name in this.config) {
                let connection = yield this.Connect(name);
                yield connection.dropDatabase();
            }
        });
    }
}
exports.Manager = Manager;
function RegisterEntity(name, options) {
    return (entity) => {
        Manager.addEntity(name, entity);
    };
}
exports.RegisterEntity = RegisterEntity;
//# sourceMappingURL=ORM.js.map