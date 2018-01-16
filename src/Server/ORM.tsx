import * as ORM from "typeorm";

export interface Config {
    [name: string]: ORM.ConnectionOptions
}

interface Map<T> {
    [K: string]: T;
}

const Entities: Map<any[]> = {};

export class Manager {
    private conn: Map<ORM.Connection> = {};
    private connPromises: Map<Promise<ORM.Connection>> = {};

    public static addEntity(name: any, entity: any) {
        if (Entities[name]) {
            Entities[name].push(entity);
        }
        else {
            Entities[name] = [entity]
        }
    }

    public static getEntity(...args: any[]): any[] {
        let result = [];

        if (args && args.length > 0) {
            args.forEach(name => {
                result = result.concat(Entities[name]);
            });
        } else {
            for (let name in Entities) {
                result = result.concat(Entities[name]);
            }
        }

        return result;
    }

    private config: Config

    constructor(config: Config) {
        this.config = config;
    }

    public async Connect(name: string = 'Main'): Promise<ORM.Connection> {
        if (!this.conn[name] && !this.connPromises[name]) {
            let resolve = async () => {
                this.conn[name] = await this.init(this.config[name]);
                return this.conn[name];
            };
            this.connPromises[name] = resolve();
        }

        await this.connPromises[name];

        return this.conn[name];
    }

    private async init(config): Promise<ORM.Connection> {
        return ORM.createConnection(config);
    }

    public async Test() {
        for (let name in this.config) {
            let connection = await this.Connect(name);
        }
    }

    public async Sync(mode: 'passive' | 'force' | 'standart' = 'standart') {
        for (let name in this.config) {
            let connection = await this.Connect(name);
            if (mode == 'force') {
                try {
                    await connection.synchronize();
                }
                catch(e) {
                    await connection.synchronize(true);
                }
            }
            else if (mode == 'passive') {
                try {
                    await connection.synchronize();
                }
                catch(e) {}
            }
            else if (mode == 'standart') {
                await connection.synchronize();
            }
        }
    }

    public async Drop() {
        for (let name in this.config) {
            let connection = await this.Connect(name);
            await connection.dropDatabase();
        }
    }
}

export function RegisterEntity(name: string, options?: any): (target: any) => void {

    return (entity: any): void => {
        Manager.addEntity(name, entity);
    }
}