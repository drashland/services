interface File {
  filename: string;
  replaceTheRegex: RegExp | string;
  replaceWith: string;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

class PreReleaseCiService {
  /**
   * @param args - Deno.args. For example, say you have a file `a.ts`, you do
   * `deno run -A a.ts --version=release-v1.2.3 --some-other-arg=hello`. The
   * args would be * `--version=release-v1.2.3` and `--some-other-arg=hello`.
   * @param files - List of files to update with the version strings.
   */
  public bump(args: string[], files: File[]): void {
    const branch: string = args[0].split("=")[1]; // ["--version", "release-vX.X.X"]
    const version = branch.substring(branch.indexOf("v") + 1); // 1.0.5

    files.forEach((file) => {
      file.replaceWith = file.replaceWith.replace(
        "{{ thisModulesLatestVersion }}",
        version,
      );
      let fileContent = decoder.decode(Deno.readFileSync(file.filename));
      fileContent = fileContent.replace(file.replaceTheRegex, file.replaceWith);
      Deno.writeFileSync(file.filename, encoder.encode(fileContent));
    });
  }
}
