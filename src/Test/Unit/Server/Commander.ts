import { Commander } from '../../../Server/Commander';

describe("Server/Commander", function () {
    it("test command", function () {
        let tested: boolean = false;
        let commander = new Commander({
            test: {
                description: 'test',
                action: args => {
                    if (args[0] == 'ttt') tested = true;
                }
            }
        });
        commander.run('test', ['ttt'], false);
        expect(true).toBe(tested);
    });
});