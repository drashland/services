import { colors } from "./deps.ts";

export class LoggerService {
  /**
   * Log a debug message.
   *
   * @param message The message to log.
   */
  public static logDebug(message: string): void {
    console.log(colors.green("DEBUG") + " " + message);
  }

  /**
   * Log an error message.
   *
   * @param message The message to log.
   */
  public static logError(message: string): void {
    console.log(colors.red("ERROR") + " " + message);
  }

  /**
   * Log an info message.
   *
   * @param message The message to log.
   */
  public static logInfo(message: string): void {
    console.log(colors.blue("INFO") + " " + message);
  }
}
