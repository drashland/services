import { LoggerService } from "../logger/logger_service.ts";

interface ICommandOptions {
  requires_args: boolean;
}

interface ICommand {
  handler: (args: string[]) => void;
  options: ICommandOptions;
}

interface IExampleUsageData {
  description: string;
  examples: string[];
}

interface IHelpMenuData {
  commands: { [key: string]: string };
  description: string;
  example_usage: IExampleUsageData[];
  options?: {
    [key: string]: {
      [key: string]: string;
    };
  };
  usage: string[];
}

/**
 * A class to help build CLIs.
 */
export class CliService {

  /**
   * A porperty to hold Deno.args.
   */
  protected args: string[];

  /**
   * A property to hold all available commands.
   */
  protected commands: { [key: string]: ICommand } = {};

  /**
   * A property to hold the logger. This class logs when errors occur.
   */
  protected logger: LoggerService;

  /**
   * A list of recognized commands. If any command is not recognized, this class
   * will display an error.
   */
  protected recognized_commands: string[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param args - Deno.args
   */
  constructor(args: string[]) {
    // Make a clone of the array in case it's readonly. We want this to be
    // mutable.
    this.args = args.slice();

    this.logger = new LoggerService();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add a command to the CLI that is being built with this class.
   */
  public addCommand(
    command: string,
    handler: (args: string[]) => void,
    options: ICommandOptions = {
      requires_args: false,
    },
  ): this {
    // Track that this is a recognized command
    this.recognized_commands.push(command);

    // Add the command to the list of commands
    this.commands[command] = {
      handler,
      options,
    };

    return this;
  }

  /**
   * Run this service.
   */
  public run() {
    if (this.args.length <= 0) {
      this.commands["help"].handler(this.args);
      Deno.exit();
    }

    const command = this.args[0];
    this.commandExists(command);

    // Take off the first argument, which would be the command
    this.args.shift();

    if (this.commands[command].options.requires_args && this.args.length <= 0) {
      this.logger.logError(`Command \`${command}\` requires arguments.`);
      Deno.exit();
    }

    // Execute the command
    this.commands[command].handler(this.args);
  }

  /**
   * Create the help menu.
   *
   * @param data - The data to use to create the help menu.
   *
   * @returns The help menu output.
   */
  public static createHelpMenu(data: IHelpMenuData): string {
    let output = "\n";

    for (const key in data) {
      if (key == "description") {
        output += this.wordWrap(data[key]);
      }

      if (key == "usage") {
        output += `\n\nUSAGE\n\n`;
        data[key].forEach((usageLine: string) => {
          output += ("    " + usageLine + "\n");
        });
      }

      if (key == "commands") {
        output += `\n\nCOMMANDS\n`;
        for (const command in data[key]) {
          output += (`\n    ${command}\n`);
          output += (`        ${this.wordWrap(`${data[key][command]}`, 8)}\n`);
        }
      }

      if (key == "options") {
        output += `\n\nOPTIONS\n\n    Options are categorized by command.\n`;
        for (const command in data[key]!) {
          output += (`\n    ${command}\n`);
          for (const option in data[key]![command]) {
            output += (`        ${option}\n`);
            output +=
              (`${
                this.wordWrap(`            ${data[key]![command][option]}`, 12)
              }\n`);
          }
        }
      }

      if (key == "example_usage") {
        output += `\n\nEXAMPLE USAGE\n`;
        data[key].forEach((exampleUsageData: IExampleUsageData) => {
          output +=
            (`\n    ${this.wordWrap(exampleUsageData.description, 4)}\n`);
          exampleUsageData.examples.forEach((example: string) => {
            output += (`        ${example}\n`);
          });
        });
      }
    }

    return output;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Does the command that was passed in exist? That is, is it in the list of
   * recongized commands?
   *
   * @param command - The command in question.
   */
  protected commandExists(command: string): void {
    if (this.recognized_commands.indexOf(command) === -1) {
      this.logger.logError(`Command \`${command}\` not recognized.`);
      Deno.exit();
    }
  }


  /**
   * Word wrap a string. Thanks
   * https://j11y.io/snippets/wordwrap-for-javascript/.
   *
   * We use this to word wrap descriptions in the help menu.
   */
  protected static wordWrap(str: string, indent = 0): string {
    const brk = "\n" + (indent > 0 ? " ".repeat(indent) : "");
    const regex = new RegExp(/.{1,80}(\s|$)/, "g");
    const ret = str.match(regex);

    if (!ret) {
      throw new Error("Error loading help menu.");
    }

    ret.map((item: string) => {
      return item.trim();
    });

    return ret.join(brk);
  }
}
