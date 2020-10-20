interface BumpVersion {
  filename: string,
  replaceTheRegex: RegExp,
  replaceWith: string
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()

export function bumpVersions(files: BumpVersion[]) {
  files.forEach((file) => {
    let fileContent = decoder.decode(Deno.readFileSync(file.filename))
    fileContent = fileContent.replace(file.replaceTheRegex, file.replaceWith)
    Deno.writeFileSync(file.filename, encoder.encode(fileContent))
  })
}
