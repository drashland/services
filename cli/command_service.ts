import { logError } from "./logger_service.ts";

export function commandExists(commands: string[], command: string) {
  if (commands.indexOf(command) == -1) {
    logError(`Command \`${command}\` not recognized.`);
    Deno.exit();
  }
}

export function commandIs(command: string): boolean {
  return Deno.args[0] == command;
}

export function commandRequiresArgs(command: string, args: string[]): void {
  if (args.length == 1) {
    logError(`The \`${command}\` command requires an argument.`);
    Deno.exit();
  }
}

interface ICommandOptions {
  requires_args: boolean;
}

interface ICommand {
  handler: (args: string[]) => void;
  options: ICommandOptions;
}

export class CommandService {
  protected args: string[];
  protected recognized_commands: string[] = [];
  protected commands: { [key: string]: ICommand } = {};

  constructor(args: string[]) {
    this.args = args.slice();
  }

  public executeCommand() {
    if (this.args.length <= 0) {
      this.commands["help"].handler(this.args);
      Deno.exit();
    }

    const command = this.args[0];
    this.commandExists(command);
    this.args.shift();
    if (this.commands[command].options.requires_args && this.args.length <= 0) {
      logError(`Command \`${command}\` requires arguments.`);
      Deno.exit();
    }
    this.commands[command].handler(this.args);
  }

  public addCommand(
    command: string,
    handler: (args: string[]) => void,
    options: ICommandOptions = {
      requires_args: false,
    },
  ): void {
    // Track that this is a recognized command
    this.recognized_commands.push(command);

    // Add the command to the list of commands
    this.commands[command] = {
      handler,
      options,
    };
  }

  protected commandExists(command: string): void {
    if (this.recognized_commands.indexOf(command) === -1) {
      logError(`Command \`${command}\` not recognized.`);
      Deno.exit();
    }
  }
}
