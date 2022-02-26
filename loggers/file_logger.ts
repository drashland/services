/**
 * This logger writes log messages to a file.
 */
export class FileLogger {
  /**
   * The file this logger will write log messages to.
   */
  protected file: string;

  constructor(file: string = "tmp_log.log") {
    this.file = file;
  }

  /**
   * Write a log message to this.file.
   *
   * @param message - The message to be logged
   */
  public write(message: string): void {
    const line = message + "\n";
    Deno.writeTextFileSync(this.file, line, { append: true });
  }
}
