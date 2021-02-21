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

  protected getValue(): string {
    return this.command.user_input.getOptionValue(this.name);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public addOption(name: string, description: string): this {
    return this;
  }
}

