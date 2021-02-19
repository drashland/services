import { ConsoleLogger } from "../loggers/console_logger.ts";
import { Option } from "./option.ts";
import { Subcommand } from "./subcommand.ts";
import { TLogMethod } from "./types.ts";
import { UserInput } from "./user_input.ts";
export { Subcommand } from "./subcommand.ts";

/**
 * The interface of the "single source of truth" logger for the entire CLI.
 */
interface Logger {
  debug: TLogMethod;
  error: TLogMethod;
  info: TLogMethod;
  warn: TLogMethod;
}

/**
 * A class to help build CLIs.
 */
export class CliService {
  /**
   * The user's input. See UserInput for more information on its data structure.
   */
  public user_input: UserInput;

  /**
   * This CLI's main command (e.g., rhum).
   */
  public command: string;

  /**
   * This CLI's description.
   */
  public description: string;

  /**
   * This CLI's name.
   */
  public name: string;

  /**
   * This CLI's version.
   */
  public version: string;

  /**
   * A "single source of truth" logger for subcommands and options in this CLI.
   * All subcommands and options have access to this logger so they can log
   * inside of their data members.
   */
  public logger: Logger = {
    debug: ConsoleLogger.debug,
    error: ConsoleLogger.error,
    info: ConsoleLogger.info,
    warn: ConsoleLogger.warn,
  };

  /**
   * The current subcomand being created. This is set when
   * CliService.subcommand() is called.
   */
  protected current_subcommand: null | Subcommand = null;

  /**
   * This CLI's options. This is not to be confused with a subcommand's options.
   * CLI options come after the main command. Subcommand options come after the
   * subcommand.
   */
  protected options: { [key: string]: Option } = {};

  /**
   * This CLI's subcommands.
   */
  protected subcommands: { [key: string]: Subcommand } = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param name - The name of the CLI.
   */
  constructor(
    command: string,
    name: string,
    description: string,
    version: string,
  ) {
    this.command = command;
    this.name = name;
    this.description = description;
    this.version = version;
    this.user_input = new UserInput(Deno.args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Does this CLI have subcommands?
   *
   * @returns True if yes, false if no.
   */
  public hasSubcommands(): boolean {
    return Object.keys(this.subcommands).length > 0;
  }

  /**
   * Add a subcommand to the CLI that is being built with this class.
   *
   * @param name - The subcommand's name. This is also the subcommand to run.
   * For example, if name = test, then the subcommand would be test.
   * @param description - The subcommand's description.
   *
   * @returns The subcommand in object form.
   */
  public subcommand(name: string, description: string): Subcommand {
    const s = new Subcommand(this, name, description);
    this.current_subcommand = s;
    this.subcommands[name] = s;
    return s;
  }

  /**
   * Create an option for a subcommand.
   *
   * @param name - The option's name. This is also the option to run. For
   * example, if name = --hello, then the option would be --hello.
   * @param description - The option's description.
   *
   * @returns The option in object form.
   */
  public option(name: string, description: string): Option {
    const o = new Option(this, this.current_subcommand!, name, description);
    return o;
  }

  /**
   * Run this CLI.
   */
  public run(): void {
    this.validate();

    // No args or options specified?
    if (!this.user_input.hasArgs() && !this.user_input.hasOptions()) {
      return this.showHelp();
    }

    const firstUserInputItem = this.user_input.first();

    // Show help?
    if ( firstUserInputItem == "--help" || firstUserInputItem == "--h") {
      return this.showHelp();
    }

    // Show version?
    if ( firstUserInputItem == "--version" || firstUserInputItem == "-v") {
      return this.showVersion();
    }

    // If the subcommand specified exists, then run it ...
    if (this.hasSubcommand(firstUserInputItem)) {
      return this.runSubcommand(firstUserInputItem);
    }

    // ... otherwise, we have no idea what to run.
    ConsoleLogger.error(
      `Unknown input "${firstUserInputItem}" specified.`,
    );
    this.showHelp();
  }

  /**
   * Does this CLI have the subcommand in question?
   *
   * @returns True if yes, false if no.
   */
  protected hasSubcommand(subcommand: string): boolean {
    return !!this.subcommands[subcommand];
  }

  /**
   * Show this CLI's help menu.
   */
  protected showHelp(): void {
    console.log(this.createHelpMenu());
  }

  /**
   * Show this CLI's version.
   */
  protected showVersion(): void {
    console.log(
      `${this.name} ${this.version}`,
    );
  }

  /**
   * Run the specified subcommand.
   */
  protected runSubcommand(subcommandName: string): void {
    try {
      return this.subcommands[subcommandName].run();
    } catch (error) {
    }

    ConsoleLogger.error(
      `Error occurred while trying to run the "${subcommandName}" option.`,
    );
    Deno.exit(1);
  }

  /**
   * Validate this CLI and its subcommands.
   */
  protected validate(): void {
    this.validateSubcommands();
  }

  /**
   * Validate the specified subcommand.
   *
   * @param subcommand - The subcommand in question.
   */
  protected validateSubcommand(subcommand: Subcommand): void {
    if (!subcommand.handler_fn) {
      ConsoleLogger.error(
        `Subcommand "${subcommand.name}" does not have a handler.`,
      );
      Deno.exit(1);
    }
  }

  /**
   * Validate this CLI's subcommands.
   */
  protected validateSubcommands(): void {
    if (this.hasSubcommands()) {
      for (const subcommandName in this.subcommands) {
        const subcommand = this.subcommands[subcommandName];
        this.validateSubcommand(subcommand);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create this CLI's help menu.
   *
   * @returns The help menu.
   */
  protected createHelpMenu(): string {
    let description = this.description;
    let menu = `\n${this.name}${description ? " - " + description : ""}\n\n`;

    menu += `USAGE\n\n`;

    menu += `    ${this.command} [--options]\n`;
    menu += `    ${this.command} subcommand [--deno-flags]\n`;
    menu += `    ${this.command} subcommand [--deno-flags] [--options]`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    menu += `    --help\n        Show the help menu.\n`;
    menu += `    --version\n        Show the version.`;
    menu += "\n\n";

    menu += "SUBCOMMANDS\n\n";

    for (const subcommandName in this.subcommands) {
      const subcommand: Subcommand = this.subcommands[subcommandName];
      menu += `    ${subcommandName}\n        ${
        wordWrap(subcommand.description, 4)
      }\n`;
    }

    return menu;
  }
}

/**
 * Word wrap a string. Thanks
 * https://j11y.io/snippets/wordwrap-for-javascript/.
 *
 * We use this to word wrap descriptions in the help menu.
 *
 * @param str - The string to wrap.
 * @param indent - The number of spaces to indent.
 *
 * @returns A word-wrapped string.
 */
export function wordWrap(str: string, indent = 0): string {
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
