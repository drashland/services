# Loggers

A service to help log different types of messages in the console.

## Table of Contents

* [API](#api)
    * [Methods](#methods)

## API

### Methods

All methods are `static`, so you do not have to instantiate the `ConsoleLogger` class. All methods are readily available via `ConsoleLogger.{theMethod}`.

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
