import * as rl from 'readline';
import { Command } from './Commander';

export let commands: {
  [name: string]: Command
} = {}

export interface ToolOption {
  name?: string
  description: string
}

export function RegisterTool(opt: ToolOption, func: (args: string[], read: () => rl.ReadLine) => void) {
   commands[opt.name] = {
    description: opt.description,
    action: func
  }
}

export function clearModel() {
  commands = {};
}