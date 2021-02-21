import { BaseOption } from "./base_option.ts";
import { THandler } from "./types.ts";
import { UserInput } from "./user_input.ts";

/**
 * A class to represent a subcommand in the input. For example, this class can
 * represent "run" in "rhum run" if it is passed into the input.
 */
export abstract class BaseCommand {

  public description: string;
  public handler_fn: null | THandler = null;
  public name: string;
  public user_input: UserInput;

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
    name: string,
    description: string,
  ) {
    this.name = name;
    this.description = description;
    this.user_input = new UserInput(Deno.args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Does this subcommand have the specified option specified.
   *
   * @returns True if yes, false if no.
   */
  public hasOptionSpecified(optionName: string): boolean {
    return this.user_input.hasOption(optionName);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public abstract addOption(name: string, description: string): this;

  /**
   * Run this command.
   */
  public abstract run(): void;
}
