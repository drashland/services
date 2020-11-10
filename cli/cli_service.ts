import { LoggerService } from "../logger/logger_service.ts";

/**
 * requires_args
 *     Set this to true if the subcommand requires args. If args aren't passed
 *     to the subcommand's handler, then an error will be throw -- stating the
 *     subcommand requires args.
 */
interface ISubcommandOptions {
  requires_args: boolean;
}

/**
 * handler
 *     The subcommand's handler. That is, the function to execute when the
 *     subcommand runs.
 *
 * options
 *     The subcommand's options. See ISubcommandOptions.
 */
interface ISubcommand {
  handler: (args: string[]) => void;
  options: ISubcommandOptions;
}

/**
 * description
 *     The description of the example being given.
 *
 * examples
 *     An array of examples showing how to use a subcommand.
 *
 * @example
 *   {
 *     description: "Run the help subcommand."
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
 * subcommands
 *     The subcommands this CLI has where the key is the subcommand and the
 *     value is the subcommand's description.
 *
 * description
 *     The description of this CLI.
 *
 * example_usage
 *     An array of examples that show how to use the subcommand. See IExample
 *     for more information on how to structure examples.
 *
 * options
 *     A key-value pair object showing what options are available for what
 *     subcommands. The key is the subcommand and the value is a key-value pair
 *     object where the key is the option and the value is the description of
 *     the option.
 *
 * usage
 *     An array of strings showing how to use the subcommand.
 *
 * @example
 *   {
 *       description: `MyCli v1.2.3 - My cool CLI.`,
 *       usage: [
 *         "my-cli [subcommand]",
 *       ],
 *       subcommands: {
 *         "do-something": "Do something.",
 *         "help, --help": "Display the help menu.",
 *         "version, --version": "Display the version.",
 *       },
 *       options: {
 *          "--some-option": "Execute some option.",
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
  subcommands: { [key: string]: string };
  description: string;
  example_usage: IExample[];
  options?: {
    [key: string]: string,
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
   * A property to hold all available subcommand.
   */
  protected subcommands: { [key: string]: ISubcommand } = {};

  /**
   * A property that tells this class if a subcommand was passed in or not.
   */
  protected has_subcommand: boolean;

  /**
   * A list of recognized subcommand. If any subcommand is not recognized, this
   * class will display an error.
   */
  protected recognized_subcommands: string[] = [];

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
    this.has_subcommand = this.args.length <= 0;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add a subcommand to the CLI that is being built with this class.
   */
  public addSubcommand(
    subcommand: string | string[],
    handler: (args: string[]) => void,
    options: ISubcommandOptions = {
      requires_args: false,
    },
  ): this {
    if (Array.isArray(subcommand)) {
      subcommand.forEach((subcommand: string) => {
        this.addSubcommand(subcommand, handler);
      });

      return this;
    }

    // Track that this is a recognized subcommand
    this.recognized_subcommands.push(subcommand);

    // Add the subcommand to the list of subcommands
    this.subcommands[subcommand] = {
      handler,
      options,
    };

    return this;
  }

  /**
   * Does the instance of this class have a subcommand passed in?
   *
   * @returns True if a comand was passed in; false if not.
   */
  public hasSubcommand(): boolean {
    return this.has_subcommand;
  }

  /**
   * Run this service.
   */
  public run() {
    if (this.args.length <= 0) {
      this.subcommands["help"].handler(this.args);
      Deno.exit();
    }

    const subcommand = this.args[0];
    this.subcommandExists(subcommand);

    // Take off the first argument, which would be the subcommand
    this.args.shift();

    if (
      this.subcommands[subcommand].options.requires_args &&
      this.args.length <= 0
    ) {
      LoggerService.logError(
        `Subcommand \`${subcommand}\` requires arguments.`,
      );
      Deno.exit(1);
    }

    // Execute the subcommand
    this.subcommands[subcommand].handler(this.args);
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

      if (key == "subcommands") {
        output += `\n\nSUBCOMMANDS\n`;
        for (const subcommand in data[key]) {
          output += (`\n    ${subcommand}\n`);
          output +=
            (`        ${this.wordWrap(`${data[key][subcommand]}`, 8)}\n`);
        }
      }

      if (key == "options") {
        output += `\n\nOPTIONS\n`;
        for (const option in data[key]!) {
          output += (`        ${option}\n`);
          output += (`${
            this.wordWrap(
              `        ${data[key]![option]}`,
              12,
            )
          }\n`);
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
   * Does the subcommand that was passed in exist? That is, is it in the list of
   * recongized subcommands?
   *
   * @param subcommand - The subcommand in question.
   */
  protected subcommandExists(subcommand: string): void {
    if (this.recognized_subcommands.indexOf(subcommand) === -1) {
      LoggerService.logError(`Subcommand \`${subcommand}\` not recognized.`);
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
