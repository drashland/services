# Logger

A service to help log different types of messages in the console.

## Table of Contents

* [API](#api)
    * [Methods](#methods)

## API

### Methods

#### .logDebug(message: string)

* Log a debug message with a green DEBUG string.
* Example:
    ```
    LoggerService.logDebug("Some message.") // outputs => DEBUG Some message.
    ```

#### .logError(message: string)

* Log an error message with a red ERROR string.
* Example:
    ```
    LoggerService.logError("Some message.") // outputs => ERROR Some message.
    ```

#### .logInfo(message: string)

* Log an info message with a blue INFO string.
* Example:
    ```
    LoggerService.logInfo("Some message.") // outputs => INFO Some message.
    ```

#### .logWarn(message: string)

* Log a warning message with a yellow WARN string.
* Example:
    ```
    LoggerService.logWarn("Some message.") // outputs => WARN Some message.
    ```
