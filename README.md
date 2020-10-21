# services
A service to help build CLIs.

## Table of Contents

- [Help Menu](#help-menu)
- [Logging](#logging)
- [Commands](#commands)
- [Bump Versions](#bump-versions)

## Help Menu

```typescript
export { createHelpMenu } from "https://raw.githubusercontent.com/drashland/services/master/cli/help_menu_service.ts";

export function showHelp() {
  console.log(
    createHelpMenu({
      description:
        `Rhum ${version} - A lightweight testing framework for Deno.`,
      usage: [
        "rhum [command]",
      ],
      commands: {
        "make /path/to/test/file_test.ts": "Make a test file.",
        "test [options] /path/to/tests or /path/to/test/file_test.ts":
          "Run tests by specifying a test directory or test file.",
        "help": "Show the help menu.",
        "version": "Show Rhum version.",
      },
      options: {
        "test": {
          "--filter-test-case":
            "Execute the matching test case in the file(s) being tested. This option cannot be used with --filter-test-suite.",
          "--filter-test-suite":
            "Execute the matching test suite in the file(s) being tested. This option cannot be used with --filter-test-case.",
        },
      },
      example_usage: [
        {
          description:
            "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum test --filter-test-case="my test case" test_file.ts`,
            `rhum test --filter-test-case="my test case" some_dir/`,
          ],
        },
        {
          description:
            "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum test --filter-test-suite="my test suite" test_file.ts`,
            `rhum test --filter-test-suite="my test suite" some_dir/`,
          ],
        },
        {
          description: "Make a test file at /my/project/tests/my_test.ts",
          examples: [
            "rhum make /my/project/tests/my_test.ts",
          ],
        },
        {
          description: "Show the help menu.",
          examples: [
            "rhum help",
          ],
        },
        {
          description: "Show the Rhum version.",
          examples: [
            "rhum version",
          ],
        },
      ],
    }),
  );
}
```

## Logging

```typescript
import {
  logDebug,
  logError,
  logInfo,
} from "https://raw.githubusercontent.com/drashland/services/master/cli/logger_service.ts";

logInfo("Nice job!");
```

## Commands

```typescript
import {
  commandIs,
  commandRequiresArgs,
} from "https://raw.githubusercontent.com/drashland/services/master/cli/command_service.ts";

switch (true) {
    case commandIs("help"):
      showHelp();
      Deno.exit();
    case commandIs("make"):
      make(args);
      Deno.exit();
    case commandIs("test"):
      await test(args);
      Deno.exit();
    case commandIs("version"):
      // ...
      bbreak
}
```

## Bump Versions

```typescript
// file.ts
// `deno run -A file.ts --version=release-v1.9.9`
import { bumpVersions } from "https://raw.githubusercontent.com/drashland/services/master/console/bump_versions.ts";

bumpVersions(Deno.args, [
  {
    filename: "./egg.json",
    replaceTheRegex: /hello world/,
    replaceWith: "goodbye"
  },
  ...
])
```
