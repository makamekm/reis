import { Command } from './Commander';

export let commands: {
  [name: string]: Command
} = {}

export interface Toolption {
  name?: string
  description: string
}

export function RegisterTool(opt: Toolption) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>): any => {
    commands[opt.name || key] = {
      description: opt.description,
      action: descriptor.value
    }
  }
}