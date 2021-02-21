import { ConsoleLogger } from "../loggers/console_logger.ts";
import { SubcommandOption} from "./subcommand_option.ts";
import { Command } from "./command.ts";
import { Subcommand } from "./subcommand.ts";
import { TColorMethod, TLogMethod } from "./types.ts";
import { green } from "./deps.ts";

export { Command } from "./command.ts";
export { Subcommand } from "./subcommand.ts";

/**
 * The interface of the "single source of truth" logger for the entire CLI.
 */
interface ILogger {
  debug: TLogMethod;
  error: TLogMethod;
  info: TLogMethod;
  warn: TLogMethod;
}

/**
 * The interface of the "single source of truth" logger for the entire CLI.
 */
interface IColors {
  green: TColorMethod;
}

/**
 * A class to help build CLIs.
 */
export class CliService {
  /**
   * This CLI's main command (e.g., rhum).
   */
  public command: Command;

  /**
   * This CLI's color-er. It colors text in the console.
   */
  public colors: IColors = {
    green: green
  }

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
  public logger: ILogger = {
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
  // public options: { [key: string]: Option } = {};

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
    this.command = new Command(this, command, description);
    this.name = name;
    this.description = description,
    this.version = version;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add a subcommand to the CLI that is being built with this class.
   *
   * @param name - The subcommand's name. This is also the subcommand to run.
   * For example, if name = test, then the subcommand would be test.
   * @param description - The subcommand's description.
   *
   * @returns The subcommand in object form.
   */
  public addSubcommand(name: string, description: string): Subcommand {
    const s = new Subcommand(this.command, name, description);
    this.current_subcommand = s;
    this.subcommands[name] = s;
    return s;
  }

  /**
   * Does this CLI have subcommands?
   *
   * @returns True if yes, false if no.
   */
  public hasSubcommands(): boolean {
    return Object.keys(this.subcommands).length > 0;
  }

  /**
   * Run this CLI.
   */
  public run(): void {
    this.validate();

    // No args or options specified?
    if (!this.command.user_input.hasArgs() && !this.command.user_input.hasOptions()) {
      return this.showHelp();
    }

    const firstUserInputItem = this.command.user_input.first();

    // Show help?
    if (
      firstUserInputItem == "--help"
      || firstUserInputItem == "--h"
      || firstUserInputItem == "help"
    ) {
      return this.showHelp();
    }

    // Show information?
    if (
      firstUserInputItem == "--info"
      || firstUserInputItem == "-i"
      || firstUserInputItem == "info"
    ) {
      return this.showInfo();
    }

    // Show version?
    if (
      firstUserInputItem == "--version"
      || firstUserInputItem == "-v"
      || firstUserInputItem == "version"
    ) {
      return this.showVersion();
    }

    // If the subcommand specified exists, then run it ...
    if (this.hasSubcommand(firstUserInputItem)) {
      this.runSubcommand(firstUserInputItem);
      return;
    }

    // ... otherwise, we have no idea what to run.
    this.logger.error(
      `Unknown input "${firstUserInputItem}" specified.`,
    );
    this.showHelp();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected getOptionsAndValues(subcommand: Subcommand): {[key: string]: null|string} {
    let ret: {[key: string]: null|string} = {};

    for (const optionName in subcommand.options) {
      if (subcommand.hasOptionSpecified(optionName)) {
        ret[optionName] = this.command.user_input.getOption(optionName);
      }
    }

    return ret;
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
   * Show this CLI's information.
   */
  protected showInfo(): void {
    let info = `${this.name} - ${this.description}\n`;
    info += `Version: ${this.version}\n`;
    info += `Documentation: https://drash.land/rhum\n`;
    info += `GitHub: https://github.com/drashland/rhum\n`;
    console.log(info);
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
  protected async runSubcommand(subcommandName: string): Promise<void> {
    const s = this.subcommands[subcommandName];
    this.validateOptionsForSubcommand(
      s,
      this.getOptionsAndValues(s)
    );
    this.validateArgsForSubcommand(s);

    try {
      await s.run();
      Deno.exit(0);
    } catch (error) {
      this.logger.error(
        `The "${subcommandName}" subcommand is not set up properly.\n${error}`
      );
    }

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
      this.logger.error(
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

  protected validateArgsForSubcommand(subcommand: Subcommand): void {
    const args = this.command.user_input.args.slice();

    // Take off the subcommand from the args
    args.shift();

    if (args.length == 0) {
      this.logger.error(
        `The "${subcommand.name}" subcommand is missing ${subcommand.args_schema}.`
      );
      subcommand.showHelp();
      Deno.exit(1);
    }
  }

  protected validateOptionsForSubcommand(
    subcommand: Subcommand,
    optionsAndValues: {[key: string]: null|string}
  ):void {
    for (const optionName in optionsAndValues) {
      if (!optionsAndValues[optionName]) {
        this.logger.error(`The "${optionName}" option is missing <OPTION VALUE>.`);
        subcommand.options[optionName].showHelp();
        Deno.exit(1);
      }
    }
  }

  /**
   * Create this CLI's help menu.
   *
   * @returns The help menu.
   */
  protected createHelpMenu(): string {
    let description = this.description;
    let menu = `${this.name} ${this.version}${description ? " - " + description : ""}\n\n`;

    menu += `USAGE\n\n`;

    menu += `    ${this.command.name} [--option]\n`;
    menu += `    ${this.command.name} subcommand [--deno-flags] [--option]`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    menu += `    -h, --help\n        Show this menu.\n`;
    menu += `    -i, --info\n        Show information about this CLI.\n`;
    menu += `    -v, --version\n        Show this CLI's version.`;
    menu += "\n\n";

    menu += "SUBCOMMANDS\n\n";

    menu += this.createHelpMenuSubcommandsSection();

    return menu;
  }

  protected createHelpMenuSubcommandsSection(): string {
    const subcommands: {[key: string]: string}[] = [
      {
        name: "help",
        description: "Show this menu.",
      },
      {
        name: "info",
        description: "Show information about this module.",
      },
      {
        name: "version",
        description: "Show this module's verison.",
      },
    ];

    for (const subcommandName in this.subcommands) {
      const subcommand: Subcommand = this.subcommands[subcommandName];
      subcommands.push({
        name: subcommand.name,
        description: subcommand.description
      });
    }

    const sorted = subcommands.sort((
      a: {[key: string]: string},
      b: {[key: string]: string}
    ) => {
      if (a.name < b.name) {
        return -1;
      }

      if (a.name > b.name) {
        return 1;
      }

      return 0;
    });

    let ret = ``;

    for (const index in sorted) {
      ret += `    ${sorted[index].name}\n        ${
        wordWrap(sorted[index].description, 4)
      }\n`;
    }

    return ret;
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
