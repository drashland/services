import { Subcommand, CliService } from "./cli_service.ts";

export class CommandLine {

  public cli: CliService;
  public subcommand: string;

  protected deno_args: string[];
  protected deno_flags: string[] = [];
  protected arguments: {[key: string]: string|undefined} = {};
  protected options: {[key: string]: string|undefined} = {};

  constructor(cli: CliService, denoArgs: string[]) {
    this.cli = cli;
    this.deno_args = denoArgs.slice();

    // The second arg is always the subcommand
    this.subcommand = this.deno_args.shift() as string;

    this.extractDenoFlagsFromArguments();

    this.extractOptionsFromArguments();

    this.matchArgumentsToNames();
  }

  /**
   * Match all of the subcommand's argument names to their respective arguments
   * based on location in the command line. For example, the first element in
   * the signature will be taken off, which is the subcommand name. Everything
   * that follows the subcommand name will be the argument names. If the
   * subcommand signature is ...
   *
   *     run [directory] {file} <something>
   *
   * ... and the arguments are ...
   *
   *     ["thisDir", "thisFile", "something"]
   *
   * ... then the "run" subcommand name will be taken off and the following
   *     object will be created ...
   *
   *     {
   *       "[directory]: "thisDir",
   *       "{file}:      "thisFile",
   *       "<something>: "something",
   *     }
   *
   * Note that the argument names do contain their surrounding brackets.
   */
  protected matchArgumentsToNames(): void {
    (this.cli.subcommands as (typeof Subcommand)[])
      .forEach((subcommand: typeof Subcommand) => {
        const sigSplit = (subcommand as unknown as Subcommand)
          .signature
          .split(" ");
        sigSplit.shift();
        for (let i = 0; i < sigSplit.length; i++) {
          this.arguments[sigSplit[i]] = this.deno_args[i];
        }
      });
  }

  public getDenoFlags(): string[] {
    return this.deno_flags;
  }

  public getArgument(argumentName: string): null|string {
    return this.arguments[argumentName] ?? null;
  }

  public getOption(optionName: string): null|string {
    return this.options[optionName] ?? null;
  }

  protected extractDenoFlagsFromArguments(): void {
    // Extract all options from the line
    this.deno_args.forEach((datum: string) => {
      if (datum.includes("-A")) {
        this.deno_flags.push("-A");
      }
      if (datum == "--allow-all") {
        this.deno_flags.push("--allow-all");
      }
      if (datum == "--allow-read") {
        this.deno_flags.push("--allow-read");
      }
      if (datum == "--allow-run") {
        this.deno_flags.push("--allow-run");
      }
      if (datum == "--allow-write") {
        this.deno_flags.push("--allow-write");
      }
    });

    for (const index in this.deno_flags) {
      const flag = this.deno_flags[index];

      // Get the location of the flag in the line
      const flagIndex = this.deno_args.indexOf(flag);

      // Remove the flag from the line
      this.deno_args.splice(flagIndex, 1);
    }
  }

  protected extractOptionsFromArguments(): void {
    // Extract all options from the line
    this.deno_args.forEach((datum: string) => {
      if (datum.includes("--")) {
        this.options[datum] = undefined;
      }
    });

    for (const optionName in this.options) {
      // Get the location of the option in the line
      const index = this.deno_args.indexOf(optionName);

      // The input AFTER the location of the option is the value of the option
      this.options[optionName] = this.deno_args[index + 1];
      this.deno_args.splice(index + 1, 1);

      // Remove the option from the line because it now has a name and a value
      this.deno_args.splice(index, 1);
    }
  }
}
