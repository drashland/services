/**
 * A class to help interact with Deno.args.
 */
export class UserInput {
  /**
   * A property to hold Deno.args.
   */
  public deno_args: string[];

  /**
   * All args passed in the input. For example,
   *
   *     command subcommand --op-1="value" --op-a="value" arg1 arg2 argA argB
   *
   * would evaluate to
   *
   *     [ "command", "subcommand", "arg1", "arg2", "argA", "argB" ]
   */
  public args: string[];

  /**
   * All options passed in the input. For example,
   *
   *     command subcommand --op-1="value" --op-a="value" arg1 arg2 argA argB
   *
   * would evaluate to
   *
   *     Map { "--op-1" => "value", "--op-a" => "test" }
   */
  public options: Map<string, null | string>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param denoArgs - The Deno.args array.
   */
  constructor(denoArgs: string[]) {
    this.deno_args = denoArgs;
    this.args = this.getArgsFromDenoArgs();
    this.options = this.getOptionsFromDenoArgs();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the first item in the Deno.args array.
   *
   * @returns The first item.
   */
  public first(): string {
    return this.deno_args[0];
  }

  /**
   * Get the deno flags (e.g., --allow-all) from the Deno.args array.
   *
   * @returns An array of Deno flags.
   */
  public getDenoFlagsFromDenoArgs(): string[] {
    const ret: string[] = [];

    if (this.hasArg("-A")) {
      ret.push("--allow-all");
    } else {
      if (this.hasArg("--allow-net")) {
        ret.push("--allow-net");
      }
      if (this.hasArg("--allow-read")) {
        ret.push("--allow-read");
      }
      if (this.hasArg("--allow-run")) {
        ret.push("--allow-run");
      }
      if (this.hasArg("--allow-write")) {
        ret.push("--allow-write");
      }
    }

    return ret;
  }

  /**
   * Get the args from the Deno.args array. See this.args for more information.
   *
   * @returns An array of args.
   */
  public getArgsFromDenoArgs(): string[] {
    const ret: string[] = [];

    this.deno_args.forEach((input: string) => {
      if (!input.includes("--")) {
        ret.push(input);
      }
    });

    return ret;
  }

  /**
   * Get an option from the options Map.
   *
   * @returns The value of the option, or null if the option is not found.
   */
  public getOption(input: string): null | string {
    return this.options.get(input) ?? null;
  }

  /**
   * Get the options from the Deno.args array. See this.options for more
   * information.
   *
   * @returns A Map of options and their values. If an option does not have a
   * value, then its value will be null.
   */
  public getOptionsFromDenoArgs(): Map<string, null | string> {
    const ret = new Map<string, null | string>();

    this.deno_args.forEach((input: string) => {
      if (input.includes("--")) {
        if (input.includes("=")) {
          const split = input.split("=");
          ret.set(split[0], split[1] ?? null);
        } else {
          ret.set(input, null);
        }
      }
    });

    return ret;
  }

  /**
   * Does the input have the specified arg?
   *
   * @returns True if yes, false if no.
   */
  public hasArg(arg: string): boolean {
    return this.args.indexOf(arg) > 0;
  }

  /**
   * Does the input have args specified?
   *
   * @returns True if yes, false if no.
   */
  public hasArgs(): boolean {
    return this.args.length > 0;
  }

  /**
   * Does the input have the specified option?
   *
   * @returns True if yes, false if no.
   */
  public hasOption(option: string): boolean {
    return this.options.has(option);
  }

  /**
   * Does the input have options specified?
   *
   * @returns True if yes, false if no.
   */
  public hasOptions(): boolean {
    return this.options.size > 0;
  }

  /**
   * Get the last item in the Deno.args array.
   *
   * @returns The last item.
   */
  public last(): string {
    return this.deno_args[this.deno_args.length - 1];
  }
}
