import { Subcommand } from "./subcommand.ts";

export interface ISubcommandOption {
  signature: string;
  description: string;
}

/**
 * A class to represent an option in the input. For example, this class can
 * represent --option-1="value" if it is passed into the input.
 */
export abstract class SubcommandOption {

  public abstract name: string;
  public abstract description: string;
  public abstract signature: string;

  public subcommand: Subcommand;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(subcommand: Subcommand) {
    this.subcommand = subcommand;
    this.setProperties();
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
    let menu = `USAGE\n\n`;

    menu += `    ${this.subcommand.cli.command} ${this.subcommand.signature} [deno flags] ${this.signature}\n`;

    return menu;
  }

  protected setProperties(): void {
    if (this.signature) {
      const split = this.signature.split(" ");
      this.name = split[0] ?? "";
    }
  }
}

