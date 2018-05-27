import * as ORM from "typeorm";

export interface Config {
    [name: string]: ORM.ConnectionOptions
}

const entities: { [name: string]: any[] } = {};

export class ORMManager {
    private conn: ORM.Connection;
    private connPromise: Promise<ORM.Connection>;

    public static addEntity(name: any, entity: any) {
        if (entities[name]) {
            entities[name].push(entity);
        }
        else {
            entities[name] = [entity]
        }
    }

    public static getEntity(...args: any[]): any[] {
        let result = [];

        if (args && args.length > 0) {
            args.forEach(name => {
                result = result.concat(entities[name]);
            });
        } else {
            for (let name in entities) {
                result = result.concat(entities[name]);
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
        ORMManager.addEntity(name, entity);
    }
}