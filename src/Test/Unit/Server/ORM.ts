import { $it, $afterEach, $beforeEach } from 'jasmine-ts-async';
const { Client } = require('pg');

import { setConfig } from '../../../Modules/Config';

import { RegisterEntity, cleanEntities, Manager, Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from '../../../Modules/ORM';

describe("Module/ORM", () => {

    let originalTimeout;
    const username = 'root';
    const password = 'qwerty';
    const host = 'localhost';
    const db_name = 'test';

    const conStringPri = 'postgres://' + username + ':' + password + '@' + host + '/postgres';

    $beforeEach(async () => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        const client = new Client(conStringPri);
        await client.connect();
        await client.query('DROP DATABASE IF EXISTS ' + db_name);
        await client.query('CREATE DATABASE ' + db_name);
        await client.end();

        setConfig({
            default: {
                "db": {
                    "Main": {
                        "database": db_name,
                        "host": host,
                        "port": 5432,
                        "type": "postgres",
                        "username": username,
                        "password": password
                    }
                }
            }
        });

        cleanEntities();
    });

    $afterEach(async () => {
        const client = new Client(conStringPri);
        await client.connect();
        await client.query('REVOKE CONNECT ON DATABASE ' + db_name + ' FROM public;');
        await client.query('DROP DATABASE IF EXISTS ' + db_name);
        await client.end();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    $it("sync entity", async () => {
        @RegisterEntity("Test")
        @Entity("test")
        class Test {
            @PrimaryGeneratedColumn()
            id: number;

            @Column({
                length: 100,
                nullable: false,
                unique: true
            })
            @Index("name-idx")
            name: string;

            @CreateDateColumn()
            date: Date;
        }

        let commander = Manager('Main', true);
        await commander.sync();
        await commander.test();
        await commander.close();

        expect(1).toBe(1);
    });

    $it("create & get", async () => {
        @RegisterEntity("Test")
        @Entity("test")
        class Test {
            @PrimaryGeneratedColumn()
            id: number;

            @Column({
                length: 100,
                nullable: false,
                unique: true
            })
            @Index("name-idx")
            name: string;

            @CreateDateColumn()
            date: Date;
        }

        let commander = Manager('Main', true);
        await commander.sync();

        const connection = await commander.connect();
        const repo = connection.getRepository(Test);

        const test = new Test();
        test.name = 'test';
        test.date = new Date();
        await repo.save(test);

        const testLoaded = await repo.findOne({
            name: 'test'
        });

        expect(testLoaded.name).toBe('test');

        await repo.remove(testLoaded);

        const testRemovedLoaded = await repo.findOne({
            name: 'test'
        });

        expect(!!testRemovedLoaded).toBeFalsy();

        await commander.close();
    });
});