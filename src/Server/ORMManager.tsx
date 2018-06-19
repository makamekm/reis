import * as ORM from "typeorm";

const entities: { [name: string]: {
    entity: any
    scope: string
}[] } = {};

export class ORMManager {
    private conn: ORM.Connection;
    private connPromise: Promise<ORM.Connection>;

    private config: ORM.ConnectionOptions

    constructor(config: ORM.ConnectionOptions) {
        this.config = config;
    }

    public async connect(): Promise<ORM.Connection> {
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
        return await ORM.createConnection(config);
    }

    public async test() {
        await this.connect();
    }

    public async createDB(ifNotExist: boolean = true, name: string = 'test') {
        let connection = await this.connect();
        await connection.createQueryRunner().createDatabase(name || this.config.database as string, ifNotExist);
    }

    public async dropDB(ifNotExist: boolean = true, name: string = 'test') {
        let connection = await this.connect();
        await connection.createQueryRunner().dropDatabase(name || this.config.database as string, ifNotExist);
    }

    public async sync(mode: 'passive' | 'force' | 'standart' = 'standart') {
        let connection = await this.connect();
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

    public async drop() {
        let connection = await this.connect();
        await connection.dropDatabase();
    }
}

export function addEntity(name: string, scope: string, entity: any) {
    if (entities[name]) {
        entities[name].push({
            entity,
            scope
        });
    }
    else {
        entities[name] = [{
            entity,
            scope
        }]
    }
}

export function getEntity(scope: string = 'Main', ...args: string[]): any[] {
    let result = [];

    if (args && args.length > 0) {
        args.forEach(name => {
            result = result.concat(entities[name].filter(s => s.scope == scope).map(s => s.entity));
        });
    } else {
        for (let name in entities) {
            result = result.concat(entities[name].filter(s => s.scope == scope).map(s => s.entity));
        }
    }

    return result;
}

export function RegisterEntity(name: string, scope: string = 'Main'): (target: any) => void {
    return (entity: any): void => {
        addEntity(name, scope, entity);
    }
}