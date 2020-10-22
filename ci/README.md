# CI

A group of service classes to help with CI processes.

## Table of Contents

* [Bumper Service](#bumper-service)
    * [Quick Start](#bumper-service-quick-start)
    * [How It Works](#bumper-service-how-it-works)
    * [Guides](#bumper-service-guides)
        * [Bumping Module Versions In Files](#bumping-module-versions-in-files)
        * [Bumping Deno and Deno Standard Modules Versions In Files](#bumping-deno-and-deno-standard-modules-versions-in-files)
        * [Running The Bumper Service In A CI Process](#running-the-bumper-service-in-a-ci-process)

## Bumper Service

### Bumper Service: Quick Start

```typescript
const b = new BumperService("my-module-name");

b.bump([
  {
    filename: "./deps.ts",
    replaceTheRegex: /std@[0-9.]+[0-9.]+[0-9]/g,
    replaceWith: "std@1.2.3",
  },
  {
    filename: "./.github/workflows/master.yml",
    replaceTheRegex: /deno: \[".+"\]/g,
    replaceWith: `deno: ["1.2.3"]`,
  },
]);
```

### Bumper Service: How It Works

Bumping versions in files works by using the `BumperService.bump()` method. When using this method, you pass in an array of file data -- key-value pair objects. Each key-value pair object in the array should contain:

* `filename`: The path to the file needing to be updated.
* `replaceTheRegex`: The pattern to search for in the file.
* `replaceWith`: The string to replace the `replaceTheRegex` pattern matches with.

When the `.bump()` method executes, it does the following:

1. Reads the file.
2. Finds all occurrences of the `replaceTheRegex` value.
3. Replaces all occurrences with the `replaceWith` value.

### Bumper Service: Guides

#### Bumping Module Versions In Files

The first argument that the `BumperService`'s constructor takes in is the name of a module. When the `BumperService` class is instantiated, it fetches the latest version of that module (if it can find it). Once found, the `BumperService` stores the latest version of the module in the following string variable:

* `{{ thisModulesLatestVersion }}`

The `BumperService` does this so you can easily replace the `replaceTheRegex` pattern matches with the latest version of your module. For example:

```typescript
const b = new BumperService("rhum");

b.bump([
  {
    filename: "./egg.json",
    replaceTheRegex: /"version": ".+"/,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`, // becomes "version": "1.2.3"
  },
  {
    filename: "./README.md",
    replaceTheRegex: /rhum\@v.+mod.ts/g,
    replaceWith: `rhum@v{{ thisModulesLatestVersion }}/mod.ts`, // becomes rhum@v1.2.3/mod.ts
  },
  {
    filename: "./src/mod.ts",
    replaceTheRegex: /version = ".+"/g,
    replaceWith: `version = "v{{ thisModulesLatestVersion }}"`, // becomes version = "v1.2.3."
  },
]);
```

You can also specify what version you want `{{ thisModulesLatestVersions }}` to be. You do this by instantiating the `BumperService` class with two arguments:

* 1st argument: The name of the module.
* 2nd argument: `["--version=vx.x.x"]` where `x.x.x` is the version you want `{{ thisModulesLatestVersion }}` to be.

For example:

```typescript
const b = new BumperService("dmm", ["--version=1.2.3"]);

b.bump([
  {
    filename: "./egg.json",
    replaceTheRegex: regexes.egg_json,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`, // becomes "version": "1.2.3"
  },
  {
    filename: "./README.md",
    replaceTheRegex: regexes.urls,
    replaceWith: `dmm@v{{ thisModulesLatestVersion }}`, // becomes dmm@v1.2.3
  },
  {
    filename: "./src/commands/version.ts",
    replaceTheRegex: regexes.const_statements,
    replaceWith: `version = "{{ thisModulesLatestVersion }}"`, // becomes version = "1.2.3."
  },
]);
```

#### Bumping Deno and Deno Standard Modules Versions In Files

By default, the `BumperService` fetches the latest Deno and Deno Standard Modules versions. These versions are then stored in the following string variables:

* `{{ latestDenoVersion }}`
* `{{ latestStdVersion }}`

The `BumperService` does this so you can easily replace `replaceTheRegex` pattern matches with the latest Deno and Deno Standard Modules versions. For example:

```typescript
const b = new BumperService("my-module-name");

b.bump([
  {
    filename: "./deps.ts",
    replaceTheRegex: /std@[0-9.]+[0-9.]+[0-9]/g,
    replaceWith: "std@{{ latestStdVersion }}", // becomes std@x.x.x where x.x.x is the latest Deno Standard Modules version
  },
  {
    filename: "./.github/workflows/master.yml",
    replaceTheRegex: /deno: \[".+"\]/g,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`, // becomes deno: ["x.x.x"] where x.x.x is the latest Deno version
  },
]);
```

#### Running The Bumper Service In A CI Process

Let's say you have an `app.ts` file you want to keep updated with the latest Deno version. You want to check that this file has the latest Deno version, and if it does not, then you want to update it and create a pull request to update this file to reflect the latest Deno version. It looks like the following:

```typescript
// File: app.ts

const denoVersion = "v1.2.3";
```

The first thing you will need is a script to help you update this file. Let's say you have a `bumper.ts` file. It looks like the following:

```typescript
// File: bumper.ts

import { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";

const b = new BumperService("my-module-name");

b.bump([
  {
    filename: "./app.ts",
    replaceTheRegex: /version = ".+"/g,
    replaceWith: `version = "v{{ latestDenoVersion }}"` // becomes version = "vx.x.x" where x.x.x is the latest Deno version
  }
]);
```

To automate this process using the CI, you will need a GitHub workflow file that runs on a schedule (a cron job). Let's say you have a `bumper.yml` GitHub workflow file that runs every day. It looks like the following:

```yaml
name: bumper
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  update-dep:
    strategy:
      matrix:
        deno: ["1.2.3"]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Deno
        uses: denolib/setup-deno@master
        with:
          deno-version: ${{ matrix.deno }}

      - name: Bump Versions
        run: deno run -A ./bumper_service.ts

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v2
        with:
          token: ${{ secrets.CI_USER_PAT }}
          commit-message: Update dependencies
          title: Update dependencies
          body: This was auto-generated by GitHub Actions.
          branch: update-dependencies
```

You'll notice that this `bumper.yml` GitHub workflow file has a `Bump Versions` step that includes running the `bumper.ts` script. This GitHub workflow file basically says the following:

_At 00:00 every day, install Deno, run `bumper.ts`, and create a pull request if there are changes to the current repository's files._

Now, you have a GitHub workflow file that runs on a schedule to check if your `app.ts` file is up to date or not. If it's not, then the `bumper.ts` file will update it, and a pull request will be made so that you can review the changes that reflect the latest Deno version.
