import { Command } from './Commander';
export declare let commands: {
    [name: string]: Command;
};
export interface Toolption {
    name?: string;
    description: string;
}
export declare function RegisterTool(opt: Toolption): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => any;
