import * as rl from 'readline';

import * as Translation from '../Modules/Translation';

export type Command = {
  description: string
  action: (args: string[], read: rl.ReadLine) => (Promise<void> | void)
}

export class Commander {

  private read: rl.ReadLine

  private commands: { [name: string]: Command }

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

    this.read = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public async run(name: string, args: string[]) {
    await this.commands[name].action(args, this.read);
    this.read.close();
    process.exit();
  }
}