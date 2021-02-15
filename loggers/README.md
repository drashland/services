# Loggers

A service to help log messages in the console or write logs to a file.

## Table of Contents

* [ConsoleLogger](#consolelogger)
* [FileLogger](#filelogger)

## ConsoleLogger

All methods are `static`, so you do not have to instantiate the `ConsoleLogger` class.

### Methods

#### .debug(message: string)

* Log a debug message with a green DEBUG string.
* Example:
    ```
    ConsoleLogger.debug("Some message.") // outputs => DEBUG Some message.
    ```

#### .error(message: string)

* Log an error message with a red ERROR string.
* Example:
    ```
    ConsoleLogger.error("Some message.") // outputs => ERROR Some message.
    ```

#### .info(message: string)

* Log an info message with a blue INFO string.
* Example:
    ```
    ConsoleLogger.info("Some message.") // outputs => INFO Some message.
    ```

#### .warn(message: string)

* Log a warning message with a yellow WARN string.
* Example:
    ```
    ConsoleLogger.warn("Some message.") // outputs => WARN Some message.
    ```

## FileLogger

The `FileLogger` should be instantiated with a target file (e.g. `/path/to/file.log`).

### Methods

#### .write(message: string)

* Writes a message to the log file.
* Example:
    ```
    FileLogger.write("Some message.")
    ```