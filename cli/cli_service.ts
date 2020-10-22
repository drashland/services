import { LoggerService } from "../logger/logger_service.ts";

/**
 * requires_args
 *     Set this to true if the command requires args. If args aren't passed to
 *     the command's handler, then an error will be throw -- stating the command
 *     requires args.
 */
interface ICommandOptions {
  requires_args: boolean;
}

/**
 * handler
 *     The commands handler. That is, the function to execute when the command
 *     runs.
 *
 * options
 *     The commands options. See ICommandOptions.
 */
interface ICommand {
  handler: (args: string[]) => void;
  options: ICommandOptions;
}

/**
 * description
 *     The description of the example being given.
 *
 * examples
 *     An array of examples showing how to use a command.
 *
 * @example
 *   {
 *     description: "Run the help command."
 *     examples: [
 *       "my-cli help",
 *       "my-cli --help",
 *     ]
 *   }
 */
interface IExample {
  description: string;
  examples: string[];
}

/**
 * commands
 *     The commands this CLI has where the key is the command and the value is
 *     the command's description.
 *
 * description
 *     The description of this CLI.
 *
 * example_usage
 *     An array of examples that show how to use the command. See IExample for
 *     more information on how to structure examples.
 *
 * options
 *     A key-value pair object showing what options are available for what
 *     commands. The key is the command and the value is a key-value pair object
 *     where the key is the option and the value is the description of the
 *     option.
 *
 * usage
 *     An array of strings showing how to use the command.
 *
 * @example
 *   {
 *       description: `MyCli v1.2.3 - My cool CLI.`,
 *       usage: [
 *         "my-cli [command]",
 *       ],
 *       commands: {
 *         "do-something": "Do something.",
 *         "help, --help": "Display the help menu.",
 *         "version, --version": "Display the version.",
 *       },
 *       options: {
 *         "do-something": {
 *           "--some-option":
 *             "Execute some option.",
 *         },
 *       },
 *       example_usage: [
 *         {
 *           description:
 *             "Do something and pass in an option.",
 *           examples: [
 *             `my-cli do-something --some-option`,
 *           ],
 *         },
 *         {
 *           description:
 *             "Display the help menu.",
 *           examples: [
 *             `my-cli help`,
 *             `my-cli --help`,
 *           ],
 *         },
 *       ],
 *     });
 *   }
 */
interface IHelpMenuData {
  commands: { [key: string]: string };
  description: string;
  example_usage: IExample[];
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
   * A property that tells this class if a command was passed in or not.
   */
  protected has_command: boolean;

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
    this.has_command = this.args.length <= 0;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add a command to the CLI that is being built with this class.
   */
  public addCommand(
    command: string | string[],
    handler: (args: string[]) => void,
    options: ICommandOptions = {
      requires_args: false,
    },
  ): this {
    if (Array.isArray(command)) {
      command.forEach((command: string) => {
        this.addCommand(command, handler);
      });

      return this;
    }

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
   * Does the instance of this class have a command passed in?
   *
   * @returns True if a comand was passed in; false if not.
   */
  public hasCommand(): boolean {
    return this.has_command;
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
      LoggerService.logError(`Command \`${command}\` requires arguments.`);
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
        data[key].forEach((exampleUsageData: IExample) => {
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
      LoggerService.logError(`Command \`${command}\` not recognized.`);
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
