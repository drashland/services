import { CliService, wordWrap } from "./cli_service.ts";
import { Subcommand } from "./subcommand.ts";

/**
 * A class to represent an option in the input. For example, this class can
 * represent --option-1="value" if it is passed into the input.
 */
export class Option {

  /**
   * The CLI this option belongs to.
   */
  public cli: CliService;

  /**
   * This option's name.
   */
  public name: string;

  /**
   * This option's description.
   */
  public description: string;

  /**
   * The subcommand this option belongs to.
   */
  public subcommand: Subcommand;

  /**
   * The value of this option. For example, if --option-1="someValue" is passed
   * in the this.cli.user_input, then "someValue" will be the value the
   * this.cli.user_input object would store.
   */
  public value: null | string = null;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param cli - See this.cli for more information.
   * @param subcommand - See this.subcommand for more information.
   * @param name - The name of this option (e.g., --some-option).
   * @param description - The description of this option.
   */
  constructor(
    cli: CliService,
    subcommand: Subcommand,
    name: string,
    description: string,
  ) {
    this.cli = cli;
    this.subcommand = subcommand;
    this.name = name;
    this.description = description;
    this.value = subcommand.cli.user_input.getOption(name) ?? null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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
    let cmdDescription = this.subcommand.cli.description;
    let menu = `\n${this.subcommand.cli.name}${
      cmdDescription ? " - " + cmdDescription : ""
    }\n\n`;

    menu += `OPTION\n\n`;
    menu += `    ${this.name}\n`;
    menu += `        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu +=
      `    ${this.subcommand.cli.command} ${this.subcommand.name} [deno flags] ${this.name}="option value" [directory|file]\n`;

    return menu;
  }
}

