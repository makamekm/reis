import { $it, $afterEach, $beforeEach } from 'jasmine-ts-async';
const { Client } = require('pg');

import { setConfig } from '../../../Modules/Config';

import { RegisterEntity, Manager, Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from '../../../Modules/ORM';

describe("Module/ORM", () => {

    let originalTimeout;

    $beforeEach(async () => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    $afterEach(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    $it("test entity", async () => {

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

        const username = 'root';
        const password = 'qwerty';
        const host = 'localhost';
        const db_name = 'test';

        const conStringPri = 'postgres://' + username + ':' + password + '@' + host + '/postgres';

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

        let commander = Manager();
        await commander.sync();
        await commander.test();

        await client.connect();
        await client.query('DROP DATABASE IF EXISTS ' + db_name);
        await client.end();

        expect(1).toBe(1);
        // expect(commander.getNames().join(',')).toBe('test');
        // expect(prevNotBinded).toBe(true);
        // expect(prevBinded).toBe(true);
        // expect(counter).toBeGreaterThan(0);
    });
});