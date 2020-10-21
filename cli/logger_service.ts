import { colors } from "./deps.ts";

/**
 * Log a debug message.
 *
 * @param message The message to log.
 */
export function logDebug(message: string): void {
  console.log(colors.green("DEBUG") + " " + message);
}

/**
 * Log an error message.
 *
 * @param message The message to log.
 */
export function logError(message: string): void {
  console.log(colors.red("ERROR") + " " + message);
}

/**
 * Log an info message.
 *
 * @param message The message to log.
 */
export function logInfo(message: string): void {
  console.log(colors.blue("INFO") + " " + message);
}
