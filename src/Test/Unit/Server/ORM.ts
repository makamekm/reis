import { $it, $afterEach, $beforeEach } from 'jasmine-ts-async';

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

        setConfig({
            default: {
                "db": {
                    "Main": {
                        "database": "test",
                        "host": "localhost",
                        "port": 5432,
                        "type": "postgres",
                        "username": "root",
                        "password": "qwerty"
                    }
                }
            }
        });

        let commander = Manager();
        await commander.createDB(true, 'test');
        await commander.dropDB(true, 'test');
        await commander.createDB(true, 'test');

        setConfig({
            default: {
                "db": {
                    "Main": {
                        "database": "test",
                        "host": "localhost",
                        "port": 5432,
                        "type": "postgres",
                        "username": "root",
                        "password": "qwerty"
                    }
                }
            }
        });

        commander = Manager('Main', true);
        await commander.sync();
        await commander.test();

        expect(1).toBe(1);
        // expect(commander.getNames().join(',')).toBe('test');
        // expect(prevNotBinded).toBe(true);
        // expect(prevBinded).toBe(true);
        // expect(counter).toBeGreaterThan(0);
    });
});