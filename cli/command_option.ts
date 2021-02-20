import { wordWrap } from "./cli_service.ts";
import { BaseOption} from "./base_option.ts";
import { Command } from "./command.ts";

/**
 * A class to represent an option in the input. For example, this class can
 * represent --option-1="value" if it is passed into the input.
 */
export class CommandOption extends BaseOption {

  public command: Command;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param command - See this.command for more information.
   * @param name - See this.name for more information.
   * @param description - See this.description for more information.
   */
  constructor(
    command: Command,
    name: string,
    description: string,
  ) {
    super(name, description);
    this.command = command;
    this.value = this.getValue();
  }

  protected getValue(): null|string {
    return this.command.user_input.getOption(this.name);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public addOption(name: string, description: string): this {
    return this;
  }

  /**
   * Show the help menu for this option.
   */
  public showHelp(): void {
    console.log(this.createHelpMenu());
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the help menu for this option.
   *
   * @returns The help menu.
   */
  protected createHelpMenu(): string {
    let menu = `\nOPTION\n\n`;

    menu += `    ${this.name}\n`;
    menu += `        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu += `    ${this.command.name} [deno flags] ${this.name}=${this.command.cli.colors.green("<OPTION VALUE>")} [directory|file]\n`;

    return menu;
  }
}

