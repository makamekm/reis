import * as rl from 'readline';
import { Command } from './Commander';

export let commands: {
  [name: string]: Command
} = {}

export interface Toolption {
  name?: string
  description: string
}

export function RegisterTool(opt: Toolption, func: (args: string[], read: rl.ReadLine) => void) {
  commands[opt.name] = {
    description: opt.description,
    action: func
  }
}