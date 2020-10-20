import { logError } from "./logger_service.ts";

export function commandExists(commands: string[], command: string) {
  if (commands.indexOf(command) == -1) {
    logError(`Command \`${command}\` not recognized.`);
    Deno.exit();
  }
}

export function commandIs(command: string): boolean {
  return Deno.args[0] == command;
}

export function commandRequiresArgs(command: string, args: string[]): void {
  if (args.length == 1) {
    logError(`The \`${command}\` command requires an argument.`);
    Deno.exit();
  }
}
