"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const lockFile = require("lockfile");
const prependFile = require("prepend-file");
const StackTraceParser = require("stacktrace-parser");
let logDir = './';
function setLogDir(p) {
    logDir = p;
}
exports.setLogDir = setLogDir;
function waitFile(p) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield new Promise((r, e) => {
            let tryes = 0;
            let f = () => {
                if (lockFile.checkSync(p)) {
                    if (tryes < 10) {
                        setTimeout(f, 50);
                        tryes++;
                    }
                    else {
                        e(new Error('File lock timeout'));
                    }
                }
                else {
                    r();
                }
            };
            f();
        });
    });
}
exports.waitFile = waitFile;
exports.fixError = (error, type, additional) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let stack = StackTraceParser.parse(error.stack);
    let line = {
        date: new Date(),
        version: process.env.VERSION,
        message: error.message,
        stack,
        type,
        additional
    };
    let parsedMessage = '\r\n' + JSON.stringify(line);
    // await waitFile(path.resolve(logDir, 'log.lock'));
    // lockFile.lockSync(path.resolve(logDir, 'log.lock'));
    yield new Promise(r => prependFile(path.resolve(logDir, 'log.txt'), parsedMessage, (err) => {
        if (err)
            console.error(err);
        r();
    }));
    // lockFile.unlockSync(path.resolve(logDir, 'log.lock'));
    // if(fs.existsSync(path.resolve(logDir, 'log.lock'))) fs.unlinkSync(path.resolve(logDir, 'log.lock'));
});
exports.logConsole = (message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let parsedMessage = '\r\n' + message;
    // await waitFile(path.resolve(logDir, 'logConsole.lock'));
    // lockFile.lockSync(path.resolve(logDir, 'logConsole.lock'));
    yield new Promise(r => prependFile(path.resolve(logDir, 'logConsole.txt'), parsedMessage, (err) => {
        if (err)
            console.error(err);
        r();
    }));
    // lockFile.unlockSync(path.resolve(logDir, 'logConsole.lock'));
    // if(fs.existsSync(path.resolve(logDir, 'logConsole.lock'))) fs.unlinkSync(path.resolve(logDir, 'logConsole.lock'));
});
exports.fixClientError = (message, stack) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let line = {
        date: new Date(),
        version: process.env.VERSION,
        message: message,
        stack: JSON.parse(stack),
        type: 'client'
    };
    let parsedMessage = '\r\n' + JSON.stringify(line);
    // await waitFile(path.resolve(logDir, 'log.lock'));
    // lockFile.lockSync(path.resolve(logDir, 'log.lock'));
    yield new Promise(r => prependFile(path.resolve(logDir, 'log.txt'), parsedMessage, (err) => {
        if (err)
            console.error(err);
        r();
    }));
    // lockFile.unlockSync(path.resolve(logDir, 'log.lock'));
    // if(fs.existsSync(path.resolve(logDir, 'log.lock'))) fs.unlinkSync(path.resolve(logDir, 'log.lock'));
});
//# sourceMappingURL=Log.js.map