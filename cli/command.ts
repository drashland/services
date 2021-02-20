import { CliService, wordWrap } from "./cli_service.ts";
import { BaseCommand } from "./base_command.ts";
import { CommandOption } from "./command_option.ts";

/**
 * A class to represent a subcommand in the input. For example, this class can
 * represent "run" in "rhum run" if it is passed into the input.
 */
export class Command extends BaseCommand {

  public cli: CliService;

  public options: { [key: string]: CommandOption } = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param cli - See this.cli for more information.
   */
  constructor(
    cli: CliService,
    name: string,
    description: string,
  ) {
    super(name, description);
    this.cli = cli;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


public addOption(name: string, description: string): this {
  return this;
}

  /**
   * {@inhertidoc}
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create this subcommand's help menu.
   *
   * @returns The help menu.
   */
  protected createHelpMenu(): string {
    let menu = `\nCOMMAND\n\n`;

    menu += `    ${this.name}\n        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu += `    ${this.name} [subcommand] [--deno-flags] [--option] [directory|file]`
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    for (const optionName in this.options) {
      const option: CommandOption = this.options[optionName];
      menu += `    ${optionName}\n        ${wordWrap(option.description, 8)}\n`;
    }

    return menu;
  }
}

