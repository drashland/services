import { ConsoleLogger } from "../loggers/console_logger.ts";
import { TColorMethod, TLogMethod } from "./types.ts";
import { green } from "./deps.ts";
import { CommandLine } from "./command_line.ts";
import { Subcommand } from "./subcommand.ts";
import { SubcommandOption } from "./subcommand_option.ts";

export {
  Subcommand,
  SubcommandOption,
}

export interface ICliServiceConfigs {
  name: string;
  description: string;
  command: string;
  subcommands: typeof Subcommand[];
  version: string;
}

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
  public command: string;

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
   * This CLI's options. This is not to be confused with a subcommand's options.
   * CLI options come after the main command. Subcommand options come after the
   * subcommand.
   */
  // public options: { [key: string]: Option } = {};

  /**
   * This CLI's subcommands.
   */
  public subcommands: (typeof Subcommand[] | Subcommand[]) = [];

  public command_line: CommandLine;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param name - The name of the CLI.
   */
  constructor(configs: ICliServiceConfigs) {
    this.command = configs.command;
    this.name = configs.name;
    this.description = configs.description,
    this.version = configs.version;
    this.subcommands = configs.subcommands;
    this.instantiateSubcommands();

    this.command_line = new CommandLine(this, Deno.args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Run this CLI.
   */
  public run(): void {
    if (!this.command_line.subcommand) {
      return this.showHelp();
    }

    const subcommand = this.getSubcommand(this.command_line.subcommand);

    if (!subcommand) {
      this.logger.error(
        `Unknown subcommand "${this.command_line.subcommand}" specified.`
      );
      let availSubcommands = `\nAVAILABLE SUBCOMMANDS\n\n`;
      (this.subcommands as typeof Subcommand[]).forEach((subcommand: typeof Subcommand) => {
        availSubcommands += `    ${subcommand.name}\n`;
      });
      console.log(availSubcommands);
      Deno.exit(1);
    }

    subcommand.instantiateOptions();
    subcommand.handle();
  }

  /**
   * Get a subcommand.
   *
   * @returns The subcommand or null if not found.
   */
  public getSubcommand(subcommandName: string): null|Subcommand {
    const results = (this.subcommands as Subcommand[])
      .filter((subcommand: Subcommand) => {
        return subcommand.name == subcommandName;
      });

    return results[0] ?? null;
  }

  /**
   * Take the subcommands array and instantiate all of the Subcommand classes.
   */
  protected instantiateSubcommands(): void {
    let subcommands: Subcommand[] = [];

    (this.subcommands as unknown as (typeof Subcommand)[])
      .filter((subcommand: typeof Subcommand) => {
        const s = new subcommand(this)
        s.name = s.signature.split(" ")[0];
        subcommands.push(s);
      });

    this.subcommands = subcommands;
  }

  /**
   * Show this CLI's help menu.
   */
  protected showHelp(): void {
    let help = `${this.name} - ${this.description}\n\n`;

    help += `USAGE\n\n`;
    help += `    ${this.command} [option | [[subcommand] [args] [deno flags] [options]]\n`;
    help += `\n`;

    help += `OPTIONS\n\n`;
    help += `    -h, --help    Show this menu.\n`;
    help += `    -v, --version Show this CLI's version.\n`;
    help += `\n`;

    help += `SUBCOMMANDS\n\n`;
    (this.subcommands as Subcommand[]).forEach((subcommand: Subcommand) => {
      help += `    ${subcommand.name}\n`;
      help += `        ${subcommand.description}`;
   });

    console.log(help);
  }
}
