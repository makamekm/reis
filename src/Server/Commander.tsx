import * as rl from 'readline';

import * as Translation from '../Modules/Translation';

export type Action = (args: string[], read: () => rl.ReadLine) => (Promise<void> | void)

export type Command = {
  description: string
  action: Action
}

export class Commander {

  protected commands: { [name: string]: Command }

  constructor(commands: { [name: string]: Command }) {
    this.commands = commands;

    this.commands.help = {
      description: Translation.transDefault('Commander.help.Description') || "Show all awalable commands",
      action: args => {
        console.log(Translation.transDefault('Commander.help.Inline.Commands') || "Commands:");
        console.log('');

        for (var name in commands) {
          console.log(Translation.transDefault('Commander.help.Inline.Name' || "    Name: $0$", name));
          console.log(Translation.transDefault('Commander.help.Inline.Description' || "    Description: $0$", commands[name].description));
          console.log('');
        }
      }
    };
  }

  public getAction(name: string): Action {
    return this.commands[name] && this.commands[name].action;
  }

  public async run(name: string, args: string[], exit: boolean = true) {
    await this.getAction(name)(args, () => rl.createInterface({
      input: process.stdin,
      output: process.stdout
    }));
    if (exit) process.exit();
  }
}