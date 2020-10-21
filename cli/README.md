# CLI

A service to help develop CLIs.

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
}
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
