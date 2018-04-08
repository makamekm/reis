import * as ORM from "typeorm";

export interface Config {
    [name: string]: ORM.ConnectionOptions
}

interface Map<T> {
    [K: string]: T;
}

const Entities: Map<any[]> = {};

export class Manager {
    private conn: ORM.Connection;
    private connPromise: Promise<ORM.Connection>;

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

    public async Connect(): Promise<ORM.Connection> {
        if (!this.conn && !this.connPromise) {
            let resolve = async () => {
                this.conn = await this.init(this.config);
                return this.conn;
            };
            this.connPromise = resolve();
        }

        await this.connPromise;

        return this.conn;
    }

    private async init(config): Promise<ORM.Connection> {
        return ORM.createConnection(config);
    }

    public async Test() {
        let connection = await this.Connect();
    }

    public async Sync(mode: 'passive' | 'force' | 'standart' = 'standart') {
        let connection = await this.Connect();
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

    public async Drop() {
        let connection = await this.Connect();
        await connection.dropDatabase();
    }
}

export function RegisterEntity(name: string, options?: any): (target: any) => void {

    return (entity: any): void => {
        Manager.addEntity(name, entity);
    }
}