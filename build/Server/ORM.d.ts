import * as ORM from "typeorm";
export interface Config {
    [name: string]: ORM.ConnectionOptions;
}
export declare class Manager {
    private conn;
    private connPromises;
    static addEntity(name: any, entity: any): void;
    static getEntity(...args: any[]): any[];
    private config;
    constructor(config: Config);
    Connect(name?: string): Promise<ORM.Connection>;
    private init(config);
    Test(): Promise<void>;
    Sync(mode?: 'passive' | 'force' | 'standart'): Promise<void>;
    Drop(): Promise<void>;
}
export declare function RegisterEntity(name: string, options?: any): (target: any) => void;
