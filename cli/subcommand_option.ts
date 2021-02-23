import { BaseOption} from "./base_option.ts";
import { Subcommand } from "./subcommand.ts";

/**
 * A class to represent an option in the input. For example, this class can
 * represent --option-1="value" if it is passed into the input.
 */
export class SubcommandOption extends BaseOption {

  public args_schema: string;
  public subcommand: Subcommand;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param subcommand - See this.subcommand for more information.
   * @param name - See this.name for more information.
   * @param description - See this.description for more information.
   */
  constructor(
    subcommand: Subcommand,
    name: string,
    description: string,
    argsSchema: string,
  ) {
    super(name, description);
    this.args_schema = argsSchema;
    this.subcommand = subcommand;
    this.value = this.getValue();
  }

  protected getValue(): string {
    return this.subcommand.user_input.getOptionValue(this.name);
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
    let menu = `USAGE\n\n`;

    menu += `    ${this.subcommand.command.name} ${this.subcommand.name} [deno flags] ${this.name}=${this.subcommand.command.cli.colors.green(this.args_schema)} <ARGS>\n`;

    return menu;
  }
}

