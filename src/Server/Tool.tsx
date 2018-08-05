import * as rl from 'readline';
import { Command, Action } from './Commander';

export let commands: {
  [name: string]: Command
} = {}

export function getCommands(): {
  [name: string]: Command
} {
  return commands
}

export interface ToolOption {
  name: string
  description?: string
}

export function RegisterCommand(opt: ToolOption, func: Action) {
   commands[opt.name] = {
    description: opt.description,
    action: func
  }
}

export function clearModel() {
  commands = {};
}