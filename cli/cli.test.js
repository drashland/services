const Command = require("./test-cli");
const { expect } = require("@jest/globals");

const cmd = new Command("test <scope> <server>").options("help", "--no--");
cmd.helpMessage = "This is the custom help message";

test("generates correct object for arguments and options", () => {
    expect(cmd.option).toBe("help");
});

test("Correctly parses and stores command line arguments(scope)", () => {
    expect(cmd.arguments.scope).toBe("scope-text");
});

test("Correctly parses and stores command line arguments(server)", () => {
    expect(cmd.arguments.server).toBe("server-text");
});

test("Shows correct help message", () => {
    expect(cmd.helpMessage).toBe("This is the custom help message");
});