/**
 * A class to represent an option in the input. For example, this class can
 * represent --option-1="value" if it is passed into the input.
 */
export abstract class BaseOption {

  /**
   * This option's name.
   */
  public name: string;

  /**
   * This option's description.
   */
  public description: string;

  /**
   * The value of this option. For example, if --option-1="someValue" is passed
   * in the this.cli.user_input, then "someValue" will be the value the
   * this.cli.user_input object would store.
   */
  public value: string = "";

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
    name: string,
    description: string,
  ) {
    this.name = name;
    this.description = description;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected abstract getValue(): string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
}

