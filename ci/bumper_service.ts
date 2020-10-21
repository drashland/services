import { logError, logInfo } from "../cli/logger_service.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface File {
  filename: string;
  replaceTheRegex: RegExp;
  replaceWith: string;
}

interface ParsedArgs {
  branch?: string; // value of --version arg
}

interface Versions {
  latest: string; // "v1.2.3"
  versions: string[]; // ["v1.2.3", "v1.2.2", ...[
}

/**
 * Used to update version strings as part of the bumper CI process when new
 * Deno, Deno Std, and Drash Land module version are released.
 */
export class BumperService {

  /**
   * A property to determine whether or not the .bump() method should bump for
   * pre-release.
   */
  public is_for_pre_release = false;

  /**
   * A property to hold Deno.args.
   */
  protected args: string[];

  /**
   * A list of latest versions. This object should contain (at the very least):
   *     - This module's latest version
   *     - Deno's latest version
   *     - Deno Std's latest version
   */
  protected latest_versions: { [key: string]: string } = {};

  /**
   * The name of the module using this class.
   */
  protected module_name: string;

  /**
   * A property to hold the Deno.args parsed into key-value pairs.
   */
  protected parsed_args: ParsedArgs;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONTRUCTOR //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param moduleName - The name of the module using this class.
   */
  constructor(moduleName: string, args: string[]) {
    this.module_name = moduleName;

    // Make a copy of the args in case they're readonly, which means we can't
    // mutate them. We want them mutable just in case.
    this.args = args.slice();

    // Parse the arguments into key-value pairs
    this.parsed_args = this.getParsedArgs();

    // Are we using this class to bump versions for pre-release?
    if (this.parsed_args.branch) {
      this.is_for_pre_release = true;
    }

    // Set all of the latest versions that we care about
    this.latest_versions[moduleName] = this.getLatestVersion(moduleName);
    this.latest_versions["deno"] = this.getLatestVersion("deno");
    this.latest_versions["deno_std"] = this.getLatestVersion("std");
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Bump all occurances of Deno and Deno Std versions in the filesystem.
   *
   * @example
   * const files = [
   *   {
   *     filename: "./README.md",
   *     replaceTheRegex: /drash@v[0-9.]+[0-9.]+[0-9]/g,
   *     replaceWith: "drash@v{{ latestDrashRelease }}"
   *   }
   * ]
   *
   *   - Replace drash versions; use `replaceWith: "{{ latestDrashVersion }}"`
   *   - Replace std versions; use `...: "{{ latestStdVersion }}"`
   *   - Replace deno versions; use `...: "{{ latestDenoVersion }}"`
   *
   * All versions do not have the `v`, so add them yourself
   *
   * @param files - Files to replace content in and re-write to fs
   */
  public bump(files: File[]): void {
    if (this.is_for_pre_release) {
      return this.bumpForPreRelease(files);
    }

    files.forEach((file) => {
      file.replaceWith = file.replaceWith.replace(
        "{{ latestDenoVersion }}",
        this.latest_versions.deno,
      );

      file.replaceWith = file.replaceWith.replace(
        "{{ latestStdVersion }}",
        this.latest_versions.deno_std,
      );

      this.writeFile(file);
    });
  }

  /**
   * Bump all occurances of this module's version for pre-release purposes. This
   * method should bump all files that has this module's version. For example,
   * this should bump eggs.json, README.md, etc.
   *
   * @param args - Deno.args. For example, say you have a file `a.ts`, you do
   * `deno run -A a.ts --version=release-v1.2.3 --some-other-arg=hello`. The
   * args would be `--version=release-v1.2.3` and `--some-other-arg=hello`.
   * @param files - List of files to update with the version strings.
   */
  public bumpForPreRelease(files: File[]): void {
    if (!this.parsed_args.branch) {
      throw new Error(
        "Tried bumping for pre-release, but a release branch was not specified.",
      );
    }

    const version = this.parsed_args.branch.substring(
      this.parsed_args.branch.indexOf("v") + 1,
    ); // 1.0.5

    files.forEach((file) => {
      file.replaceWith = file.replaceWith.replace(
        "{{ thisModulesLatestVersion }}",
        version,
      );

      this.writeFile(file);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the latest version of the module using this class from Deno's CDN.
   * Deno's CDN responses look like the following:
   *
   *     {
   *       "latest":"v1.1.5",
   *       "versions":[
   *          "v1.1.5",
   *          "v1.1.4",
   *          "v1.1.2",
   *          "v1.1.1",
   *          "v1.1.0",
   *          "v1.0.5",
   *          "v1.0.4",
   *          "v1.0.3",
   *          "v1.0.2",
   *          "v1.0.1",
   *          "v1.0.0"
   *       ]
   *     }
   *
   * @param moduleName - The name of the module to get the latest version from.
   */
  protected async getLatestVersion(moduleName: string): string {
    const res = await fetch(
      `https://cdn.deno.land/${moduleName}/meta/versions.json`,
    );
    const version: Versions = await res.json();
    return version.latest.replace("v", "");
  }

  /**
   * Parse Deno.args into key-value pairs.
   *
   * @returns A key-value pair object where the key is the arg and the value is
   * the arg value. For example, if --version=v1.2.3, then the key would be
   * version and the value would be v1.2.3.
   */
  protected getParsedArgs(): ParsedArgs {
    let args: ParsedArgs = {};

    this.args.forEach((arg: string) => {
      if (arg.includes("--version")) {
        args.branch = arg.split("=")[1];
      }
    });

    return args;
  }

  /**
   * Write the file in question to the filesystem.
   *
   * @param file - The file to write to the filesystem.
   */
  protected writeFile(file: File) {
    try {
      logInfo(`Writing file: ${file.filename}`);
      let fileContent = decoder.decode(Deno.readFileSync(file.filename));
      fileContent = fileContent.replace(file.replaceTheRegex, file.replaceWith);
      Deno.writeFileSync(file.filename, encoder.encode(fileContent));
    } catch (error) {
      logError(error.stack);
    }
  }
}
