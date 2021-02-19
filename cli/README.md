# CLI

A service to help develop CLIs.

## Table of Contents

* [Quick Start](#quick-start)
* [ASCII Art](#ascii-art)
    * [Drash Logo](#drash-logo)

## Quick Start

```typescript
import { CliService } from "/path/to/cli_service.ts";

const service = new CliService(
  "rhum",
  "Rhum",
  "A lightweight testing framework for Deno.",
  "v2.0.0",
);

service
  .subcommand(
    "run",
    "Run tests.",
  )
  .handler(someHandler)
  .option(service.option(
    "--filter-test-case",
    "Run tests cases that match the value of this option. This cannot be used with the --filter-test-suite option.",
  ));

service.run();
```

## ASCII Art

### Drash Logo

```typescript
import {
  drashLogoInRawAscii,
  drashLogoInAsciiWithoutColour
  drashLogoInAsciiWithColour,
} from "https://raw.githubusercontent.com/drashland/services/master/cli/ascii/drash.ts"

console.log(drashLogoInRawAscii) // same for all the others
```
