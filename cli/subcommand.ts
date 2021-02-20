import { BaseCommand } from "./base_command.ts";
import { Command } from "./command.ts";
import { THandler } from "./types.ts";
import { SubcommandOption } from "./subcommand_option.ts";
import { wordWrap } from "./cli_service.ts";

/**
 * A class to represent a subcommand in the input. For example, this class can
 * represent "run" in "rhum run" if it is passed into the input.
 */
export class Subcommand extends BaseCommand {

  public command: Command;

  public options: { [key: string]: SubcommandOption } = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param cli - See this.cli for more information.
   * @param name - See this.name for more information..
   * @param description - See this.description for more information..
   * @param kind - See this.kind for more information.
   */
  constructor(
    command: Command,
    name: string,
    description: string,
  ) {
    super(name, description);
    this.command = command;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public addHandler(handler: THandler): this {
    this.handler_fn = handler;
    return this;
  }

  /**
   * Add an option to this subcommand.
   *
   * @param option - The option object. See CliService.option() for more
   * information on creating an option object.
   */
  public addOption(name: string, description: string): this {
    const o = new SubcommandOption(this, name, description);
    this.options[o.name] = o;
    return this;
  }

  /**
   * Run this subcommand.
   */
  public run(): void {
    if (!this.handler_fn) {
      this.command.cli.logger.error(
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
    let menu = `\nSUBCOMMAND\n\n`;

    menu += `    ${this.name}\n        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu +=
      `    ${this.command.name} ${this.name} [--deno-flags] [--option] ${this.command.cli.colors.green("<DIRECTORY OR FILE>")}`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    for (const optionName in this.options) {
      const option: SubcommandOption = this.options[optionName];
      menu += `    ${optionName}\n        ${wordWrap(option.description, 8)}\n`;
    }

    return menu;
  }
}

