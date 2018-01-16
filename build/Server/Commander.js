"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rl = require("readline");
const Translation = require("../Modules/Translation");
class Commander {
    constructor(commands) {
        this.commands = commands;
        this.commands.q = {
            description: Translation.transDefault('Commander.q.Description'),
            action: (read, callback) => {
                read.close();
                process.exit();
            }
        };
        this.commands.help = {
            description: Translation.transDefault('Commander.help.Description'),
            action: (read, callback) => {
                console.log(Translation.transDefault('Commander.help.Inline.Commands'));
                console.log('');
                for (var name in commands) {
                    console.log(Translation.transDefault('Commander.help.Inline.Name', name));
                    console.log(Translation.transDefault('Commander.help.Inline.Description', commands[name].description));
                    console.log('');
                }
                callback();
            }
        };
        this.read = rl.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    cycle() {
        this.read.question(Translation.transDefault('Commander.EnterCommand'), (answer) => {
            for (var name in this.commands) {
                if (name == answer) {
                    this.commands[name].action(this.read, this.cycle.bind(this));
                    return;
                }
            }
            this.cycle();
        });
    }
}
exports.Commander = Commander;
//# sourceMappingURL=Commander.js.map