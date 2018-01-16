/// <reference types="node" />
import * as rl from 'readline';
export declare type Command = {
    description: string;
    action: (read: rl.ReadLine, callback: Function) => void;
};
export declare class Commander {
    private read;
    private commands;
    constructor(commands: {
        [name: string]: Command;
    });
    cycle(): void;
}
