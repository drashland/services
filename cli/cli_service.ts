import { ConsoleLogger } from "../loggers/console_logger.ts";

type THandler = () => void | Promise<void>;

export class Option {
  public cli: CliService;
  public name: string;
  public description: string;
  public handler_fn: THandler | null = null;
  public subcommand: Subcommand;
  public value: null | string = null;

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
    this.value = subcommand.cli.input.getOption(name) ?? null;
  }

  public handler(handler: THandler): this {
    this.handler_fn = handler;
    return this;
  }

  public run() {
    if (!this.handler_fn) {
      ConsoleLogger.error(
        `Option "${this.name}" does not have a handler.`,
      );
      Deno.exit(1);
    }

    this.handler_fn();
  }

  public showHelp() {
    console.log(this.createHelpMenu());
  }

  protected createHelpMenu(): string {
    let cmdDescription = this.subcommand.cli.description;
    let menu = `\n${this.subcommand.cli.name}${
      cmdDescription ? " - " + cmdDescription : ""
    }\n\n`;

    menu += `OPTION\n\n`;
    menu += `    ${this.name}\n        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu +=
      `    ${this.subcommand.cli.command} ${this.subcommand.name} [deno flags] ${this.name}="option value" [directory|file]\n`;

    return menu;
  }
}

export class Subcommand {
  public cli: CliService;
  public name: string;
  public description: string;
  public handler_fn: null | THandler = null;
  protected options: { [key: string]: Option } = {};

  constructor(cli: CliService, name: string, description: string) {
    this.cli = cli;
    this.name = name;
    this.description = description;
  }

  public getOption(input: string): null | Option {
    return this.options[input] ?? null;
  }

  public handler(handler: THandler): this {
    if (this.handler_fn) {
      ConsoleLogger.error(
        `Subcommand "${this.name}" can only have one handler.`,
      );
      Deno.exit(1);
    }

    this.handler_fn = handler;
    return this;
  }

  public run(): void {
    if (!this.handler_fn) {
      ConsoleLogger.error(
        `Subcommand "${this.name}" does not have a handler.`,
      );
      Deno.exit(1);
    }

    this.handler_fn();
  }

  public option(option: Option): this {
    this.options[option.name] = option;
    return this;
  }

  public hasOptionSpecified(optionName: string): boolean {
    return this.cli.input.hasOption(optionName);
  }

  public showHelp(): void {
    console.log(this.createHelpMenu());
  }

  protected createHelpMenu(): string {
    let cmdDescription = this.cli.description;
    let menu = `\n${this.cli!.name}${
      cmdDescription ? " - " + cmdDescription : ""
    }\n\n`;

    menu += `SUBCOMMAND\n\n`;
    menu += `    ${this.name}\n        ${wordWrap(this.description, 8)}`;
    menu += `\n\n`;

    menu += `USAGE\n\n`;

    menu +=
      `    ${this.cli.command} ${this.name} [--deno-flags] [--options] [directory|file]`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    for (const optionName in this.options) {
      const option: Option = this.options[optionName];
      menu += `    ${optionName}\n        ${wordWrap(option.description, 8)}\n`;
    }

    return menu;
  }
}

export class Input {
  public deno_args: string[] = [];
  public args: string[] = [];
  public options: Map<string, null | string> = new Map<string, null | string>();

  constructor(denoArgs: string[]) {
    this.deno_args = denoArgs;

    this.deno_args.forEach((arg: string) => {
      if (
        arg.includes("--")
      ) {
        if (arg.includes("=")) {
          const split = arg.split("=");
          this.options.set(split[0], split[1]);
        } else {
          this.options.set(arg, null);
        }
      } else {
        this.args.push(arg);
      }
    });
  }

  public first() {
    return this.deno_args[0];
  }

  public last() {
    return this.deno_args[this.deno_args.length - 1];
  }

  public hasArg(input: string): boolean {
    return this.args.indexOf(input) > 0;
  }

  public hasOption(input: string): boolean {
    return this.options.has(input);
  }

  public getOption(input: string): null | string {
    return this.options.get(input) ?? null;
  }

  public hasOptions(): boolean {
    return this.options.size > 0;
  }

  public hasArgs(): boolean {
    return this.args.length > 0;
  }
}

/**
 * A class to help build CLIs.
 */
export class CliService {
  public input: Input;
  public command: string;
  public description: string;
  public name: string;
  public version: string;

  protected current_subcommand: null | Subcommand = null;
  protected options: { [key: string]: Option } = {};
  protected subcommands: { [key: string]: Subcommand } = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param name - The name of the CLI.
   */
  constructor(
    command: string,
    name: string,
    description: string,
    version: string,
  ) {
    this.command = command;
    this.name = name;
    this.description = description;
    this.version = version;
    this.input = new Input(Deno.args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public hasSubcommands(): boolean {
    return Object.keys(this.subcommands).length > 0;
  }

  /**
   * Add a subcommand to the CLI that is being built with this class.
   *
   * @param subcommand
   */
  public subcommand(name: string, description: string): Subcommand {
    const s = new Subcommand(this, name, description);
    this.current_subcommand = s;
    this.subcommands[name] = s;
    return s;
  }

  public option(name: string, description: string): Option {
    const o = new Option(this, this.current_subcommand!, name, description);
    return o;
  }

  public run() {
    this.validate();

    if (!this.input.hasArgs() && !this.input.hasOptions()) {
      return this.showHelp();
    }

    const firstInputItem = this.input.first();

    if (
      firstInputItem == "--help" ||
      firstInputItem == "--h"
    ) {
      return this.showHelp();
    }

    if (
      firstInputItem == "--version" ||
      firstInputItem == "-v"
    ) {
      return this.showVersion();
    }

    if (this.hasSubcommand(firstInputItem)) {
      return this.runSubcommand(firstInputItem);
    }

    ConsoleLogger.error(
      `Unknown input "${firstInputItem}" specified.`,
    );
    this.showHelp();
  }

  protected hasSubcommand(input: string): boolean {
    return !!this.subcommands[input];
  }

  protected showVersion(): void {
    console.log(
      `${this.name} ${this.version}`,
    );
  }

  protected showHelp(): void {
    console.log(this.createHelpMenu());
  }

  protected runSubcommand(subcommandName: string): void {
    try {
      return this.subcommands[subcommandName].run();
    } catch (error) {
    }

    ConsoleLogger.error(
      `Error occurred while trying to run the "${subcommandName}" option.`,
    );
    Deno.exit(1);
  }

  protected validate(): void {
    this.validateThis();
    this.validateSubcommands();
  }

  protected validateThis() {
    if (!this.command) {
      ConsoleLogger.error(
        `CliService.command() was not called.
Please call ClicService.command() and specify the command name.`,
      );
      Deno.exit(1);
    }
  }

  protected validateSubcommand(subcommand: Subcommand): void {
    if (!subcommand.handler_fn) {
      ConsoleLogger.error(
        `Subcommand "${subcommand.name}" does not have a handler.`,
      );
      Deno.exit(1);
    }
  }

  protected validateSubcommands(): void {
    if (this.hasSubcommands()) {
      for (const subcommandName in this.subcommands) {
        const subcommand = this.subcommands[subcommandName];
        this.validateSubcommand(subcommand);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected createHelpMenu(): string {
    let description = this.description;
    let menu = `\n${this.name}${description ? " - " + description : ""}\n\n`;

    menu += `USAGE\n\n`;

    menu += `    ${this.command} [--options]\n`;
    menu += `    ${this.command} subcommand [--deno-flags]\n`;
    menu += `    ${this.command} subcommand [--deno-flags] [--options]`;
    menu += "\n\n";

    menu += "OPTIONS\n\n";

    menu += `    --help\n        Show the help menu.\n`;
    menu += `    --version\n        Show the version.`;
    menu += "\n\n";

    menu += "SUBCOMMANDS\n\n";

    for (const subcommandName in this.subcommands) {
      const subcommand: Subcommand = this.subcommands[subcommandName];
      menu += `    ${subcommandName}\n        ${
        wordWrap(subcommand.description, 4)
      }\n`;
    }

    return menu;
  }
}

/**
 * Word wrap a string. Thanks
 * https://j11y.io/snippets/wordwrap-for-javascript/.
 *
 * We use this to word wrap descriptions in the help menu.
 *
 * @param str - The string to wrap.
 * @param indent - The number of spaces to indent.
 *
 * @returns A word-wrapped string.
 */
function wordWrap(str: string, indent = 0): string {
  const brk = "\n" + (indent > 0 ? " ".repeat(indent) : "");
  const regex = new RegExp(/.{1,80}(\s|$)/, "g");
  const ret = str.match(regex);

  if (!ret) {
    throw new Error("Error loading help menu.");
  }

  ret.map((item: string) => {
    return item.trim();
  });

  return ret.join(brk);
}
