// Used to update version strings as part of the bbumper process, when new versions are releases

const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface Versions {
  latest: string, // "v1.2.3"
  versions: string[] // ["v1.2.3", "v1.2.2", ...[
}

interface File {
  filename: string,
  replaceTheRegex: RegExp,
  replaceWith: string
}

const denoVersionsRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
const denoVersions: Versions = await denoVersionsRes.json();
const latestDenoVersion = denoVersions.latest.replace("v", "");

const stdVersionsRes = await fetch("https://cdn.deno.land/std/meta/versions.json");
const stdVersions: Versions = await stdVersionsRes.json();
const latestStdVersion = stdVersions.latest.replace("v", ""); // replacing because std doesn't allow `v` in imports, so it's never seen anymore

const drashVersionsRes = await fetch("https://cdn.deno.land/drash/meta/versions.json");
const drashVersions: Versions = await drashVersionsRes.json();
const latestDrashVersion = drashVersions.latest.replace("v", "");

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
export function bumper (files: File[]) {
  files.forEach(file => {
    file.replaceWith = file.replaceWith.replace("{{ latestDrashVersion }}", latestDrashVersion)
    file.replaceWith = file.replaceWith.replace("{{ latestStdVersion }}", latestStdVersion)
    file.replaceWith = file.replaceWith.replace("{{ latestDenoVersion }}", latestDenoVersion)

    console.log(file)
    let fileContent = decoder.decode(Deno.readFileSync(file.filename))
    fileContent = fileContent.replace(file.replaceTheRegex, file.replaceWith)
    Deno.writeFileSync(file.filename, encoder.encode(fileContent))
  })
}
