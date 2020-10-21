// Used to update version strings as part of the bbumper process, when new versions are releases

const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface Versions {
  latest: string; // "v1.2.3"
  versions: string[]; // ["v1.2.3", "v1.2.2", ...[
}

interface File {
  filename: string;
  replaceTheRegex: RegExp | string;
  replaceWith: string;
}

/**
 * Used to update version strings as part of the bumper CI process when new
 * Deno, Deno Std, and Drash Land module version are released.
 */
export class BumperCiService {
  protected module_name: string;

  constructor(moduleName: string) {
    this.module_name = moduleName;
  }

  /**
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
    files.forEach((file) => {
      file.replaceWith = file.replaceWith.replace(
        "{{ thisModulesLatestVersion }}",
        this.getLatestVersion(this.module_name),
      );
      file.replaceWith = file.replaceWith.replace(
        "{{ latestStdVersion }}",
        this.getLatestVersion("std"),
      );
      file.replaceWith = file.replaceWith.replace(
        "{{ latestDenoVersion }}",
        this.getLatestVersion(this.module_name),
      );

      let fileContent = decoder.decode(Deno.readFileSync(file.filename));
      fileContent = fileContent.replace(file.replaceTheRegex, file.replaceWith);
      Deno.writeFileSync(file.filename, encoder.encode(fileContent));
    });
  }

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
}
