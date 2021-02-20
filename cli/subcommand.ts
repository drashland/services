import { CliService, wordWrap } from "./cli_service.ts";
import { THandler } from "./types.ts";
import { Option } from "./option.ts"; 

/**
 * A class to represent a subcommand in the input. For example, this class can
 * represent "run" in "rhum run" if it is passed into the input.
 */
export class Subcommand {
  public cli: CliService;
  public name: string;
  public description: string;
  public handler_fn: null | THandler = null;
  protected options: { [key: string]: Option } = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param cli - See this.cli for more information.
   * @param name - The name of this subcommand (e.g., run).
   * @param description - The description of this subcommand.
   */
  constructor(cli: CliService, name: string, description: string) {
    this.cli = cli;
    this.name = name;
    this.description = description;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get an option from this subcommand.
   *
   * @param option - The name of the option.
   *
   * @returns The Option object or null if it does not exist as one of this
   * subcommand's options.
   */
  public getOption(option: string): null | Option {
    return this.options[option] ?? null;
  }

  /**
   * Add the handler for this subcommand.
   *
   * @param handler - The handler function that this subcommand runs.
   *
   * @returns This object.
   */
  public handler(handler: THandler): this {
    if (this.handler_fn) {
      this.cli.logger.error(
        `Subcommand "${this.name}" can only have one handler.`,
      );
      Deno.exit(1);
    }

    this.handler_fn = handler;
    return this;
  }

  /**
   * Does this subcommand have the specified option specified.
   *
   * @returns True if yes, false if no.
   */
  public hasOptionSpecified(optionName: string): boolean {
    return this.cli.user_input.hasOption(optionName);
  }

  /**
   * Add an option to this subcommand.
   *
   * @param option - The option object. See CliService.option() for more
   * information on creating an option object.
   */
  public option(option: Option): this {
    this.options[option.name] = option;
    return this;
  }

  /**
   * Run this subcommand.
   */
  public run(): void {
    if (!this.handler_fn) {
      this.cli.logger.error(
        `Subcommand "${this.name}" does not have a handler.`,
      );
      Deno.exit(1);
    }

    this.handler_fn();
  }

  /**
   * Show this subcommand's help menu.
   */
  public showHelp(): void {
    console.log(this.createHelpMenu());
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create this subcommand's help menu.
   *
   * @returns The help menu.
   */
  protected createHelpMenu(): string {
    let cmdDescription = this.cli.description;
    let menu = `\n${this.cli!.name}${
      cmdDescription ? " - " + cmdDescription : ""
    }\n\n`;

    menu += `SUBCOMMAND\n\n`;
    menu += `    ${this.name}\n        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu +=
      `    ${this.cli.command} ${this.name} [--deno-flags] [--option] [directory|file]`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    for (const optionName in this.options) {
      const option: Option = this.options[optionName];
      menu += `    ${optionName}\n        ${wordWrap(option.description, 8)}\n`;
    }

    return menu;
  }
}
