# CI

A service to help with CI processes.

## Table of Contents

* [Bumper Service](#bumper-service)
    * [Quick Start](#bumper-service-quick-start)
    * [How It Works](#bumper-service-how-it-works)
    * [Guides](#bumper-service-guides)

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
