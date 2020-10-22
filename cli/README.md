# CLI

A service to help develop CLIs.

## Table of Contents

* [Quick Start](#quick-start)
* [Help Menu Creation](#help-menu-creation)
* [API](#api)
    * [Methods](#methods)
    * [Interfaces](#interfaces)

## Quick Start

```typescript
import { CliService } from "https://raw.githubusercontent.com/drashland/services/master/cli/cli_service.ts";
import { help } from "./src/commands/help.ts";
import { version } from "./src/commands/version.ts";
import { doSomething } from ".src/commands/do_something.ts";

const c = new CliService(Deno.args)

// Add a help command
c.addCommand("help", () => {
  console.log(help); // See Help Menu Creation section below to see how to create a help menu
});

// Add a version command
c.addCommand("version" () => {
  console.log(version);
});

// Add a do-something command
c.addCommand("do-something", () => {
  doSomething();
});

// Run the CLI service
c.run();
```

## Help Menu Creation

Use the `static` `CliService.createHelpMenu()` method to create a help menu. The following code ...

```typescript
import { CliService } from "https://raw.githubusercontent.com/drashland/services/master/cli/cli_service.ts";

export const help = CliService.createHelpMenu({
    description:
      `MyCli v1.2.3 - My cool CLI.`,
    usage: [
      "my-cli [command]",
    ],
    commands: {
      "do-something": "Do something.",
      "help, --help": "Display the help menu.",
      "version, --version": "Display the version.",
    },
    options: {
      "do-something": {
        "--some-option":
          "Execute some option.",
      },
    },
    example_usage: [
      {
        description:
          "Do something and pass in an option.",
        examples: [
          `my-cli do-something --some-option`,
        ],
      },
      {
        description:
          "Display the help menu.",
        examples: [
          `my-cli help`,
          `my-cli --help`,
        ],
      },
    ],
  });
});
```

... ouputs the following text ...

```
MyCli v1.2.3 - My cool CLI.

USAGE

    my-cli [command]


COMMANDS

    do-something
        Do something.

    help, --help
        Display the help menu.

    version, --version
        Display the version.


OPTIONS

    Options are categorized by command.

    do-something
        --some-option
            Execute some option.


EXAMPLE USAGE

    Do something and pass in an option.
        my-cli do-something --some-option

    Display the help menu.
        my-cli help
        my-cli --help
```

## API

### Methods

#### .createHelpMenu(data: IHelpMenuData)

* A `static` method to help create help menus.
* Example:
    ```typescript
    const c = CliService.createHelpMenu({ ... });
    ```

#### .addCommand(command: string|string[], handler: (args: string[]) => void, options: ICommandOptions)

* Add a command (or an array of commands) to the CLI with a handler.
* Example:
    ```typescript
    const c = CliService(Deno.args);
    
    // Add a single command
    c.addCommand("test", () => { console.log("Testing!"); });
    
    // Add an array of commands that share the same handler
    c.addCommand(["help", "--help"], () => { console.log("Help!"); });
    
    // Add a single command that has a handler that requires Deno.args.
    // You can pass in args: string[] into the handler and the CliService
    // will pass in Deno.args as the args. Also, to throw an error stating
    // that this command requires args, pass in the { requires_args: true }
    // option.
    c.addCommand(
      "make",
      (args: string[]) => {
        console.log(args); // outputs ["arg1", "arg2"] if you run `my-cli make arg1 arg2`
        doSomething(args);
      },
      {
        requires_args: true
      }
    );
    ```

#### .run()

* Run the CLI service.
* Example:
    ```typescript
    const c = CliService(Deno.args);
    c.run();
    ```

### Interfaces

```typescript
/**
 * requires_args
 *     Set this to true if the command requires args. If args aren't passed to
 *     the command's handler, then an error will be throw -- stating the command
 *     requires args.
 */
interface ICommandOptions {
  requires_args: boolean;
}

/**
 * handler
 *     The commands handler. That is, the function to execute when the command
 *     runs.
 *
 * options
 *     The commands options. See ICommandOptions.
 */
interface ICommand {
  handler: (args: string[]) => void;
  options: ICommandOptions;
}

/**
 * description
 *     The description of the example being given.
 *
 * examples
 *     An array of examples showing how to use a command.
 *
 * @example
 *   {
 *     description: "Run the help command."
 *     examples: [
 *       "my-cli help",
 *       "my-cli --help",
 *     ]
 *   }
 */
interface IExample {
  description: string;
  examples: string[];
}

/**
 * commands
 *     The commands this CLI has where the key is the command and the value is
 *     the command's description.
 *
 * description
 *     The description of this CLI.
 *
 * example_usage
 *     An array of examples that show how to use the command. See IExample for
 *     more information on how to structure examples.
 *
 * options
 *     A key-value pair object showing what options are available for what
 *     commands. The key is the command and the value is a key-value pair object
 *     where the key is the option and the value is the description of the
 *     option.
 *
 * usage
 *     An array of strings showing how to use the command.
 *
 * @example
 *   {
 *       description: `MyCli v1.2.3 - My cool CLI.`,
 *       usage: [
 *         "my-cli [command]",
 *       ],
 *       commands: {
 *         "do-something": "Do something.",
 *         "help, --help": "Display the help menu.",
 *         "version, --version": "Display the version.",
 *       },
 *       options: {
 *         "do-something": {
 *           "--some-option":
 *             "Execute some option.",
 *         },
 *       },
 *       example_usage: [
 *         {
 *           description:
 *             "Do something and pass in an option.",
 *           examples: [
 *             `my-cli do-something --some-option`,
 *           ],
 *         },
 *         {
 *           description:
 *             "Display the help menu.",
 *           examples: [
 *             `my-cli help`,
 *             `my-cli --help`,
 *           ],
 *         },
 *       ],
 *     });
 *   }
 */
interface IHelpMenuData {
  commands: { [key: string]: string };
  description: string;
  example_usage: IExample[];
  options?: {
    [key: string]: {
      [key: string]: string;
    };
  };
  usage: string[];
}
```
