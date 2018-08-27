import { LogError } from '../../Modules/Error';

describe("Module/Error", () => {
    it("create class", () => {
        const error = new LogError('TestTitle', 'warn', 'TestMessage', 'T777', 201);

        expect(error.title).toBe('TestTitle');
        expect(error.level).toBe('warn');
        expect(error.message).toBe('TestMessage');
        expect(error.code).toBe('T777');
        expect(error.status).toBe(201);
    });

    it("thowing", () => {
        let thrown = false
        try {
            throw new LogError('TestTitle', 'warn', 'TestMessage', 'T777', 201);
        } catch (error) {
            thrown = true;
            expect(error instanceof LogError).toBe(true);
            if (error instanceof LogError) {
                expect(error.title).toBe('TestTitle');
                expect(error.level).toBe('warn');
                expect(error.message).toBe('TestMessage');
                expect(error.code).toBe('T777');
                expect(error.status).toBe(201);
            }
        }
        expect(thrown).toBeTruthy();
    });
});