import { RegisterCommand, clearModel, getCommands } from '../../../Modules/Tool';

describe("Module/Tool", () => {
    beforeEach(() => {
        clearModel();
    })

    afterEach(() => {
        clearModel();
    })

    it("clearModel", () => {
        RegisterCommand({
            name: 'TestCommand'
        }, (args, read) => {});

        clearModel();

        expect(!getCommands().TestCommand).toBeTruthy();
    });

    it("RegisterCommand", () => {
        const action = (args, read) => {};
        RegisterCommand({
            name: 'TestCommand'
        }, action);

        expect(!!getCommands().TestCommand).toBeTruthy();
        expect(getCommands().TestCommand!.action).toBe(action);
    });
});