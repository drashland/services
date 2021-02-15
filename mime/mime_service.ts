import { mimeDb } from "./mime_db.ts";

export class MimeService {
  /**
   * Get a MIME type for a file based on its extension.
   *
   * @param file - The filename in question. This can be a filename, file URL,
   * or file path.
   *
   * @returns The MIME type or null if the file's extension cannot be matched
   * with any extension in the MIME database.
   * .
   */
  public static getMimeType(file: string): null | string {
    let mimeType = null;

    let fileExtension: string | string[] | undefined = file.split(".");

    if (fileExtension.length > 0) {
      fileExtension = fileExtension.pop();
    }

    for (let key in mimeDb) {
      if (!mimeType) {
        const extensions = mimeDb[key].extensions;
        if (extensions) {
          extensions.forEach((extension: string) => {
            if (fileExtension == extension) {
              mimeType = key;
            }
          });
        }
      }
    }

    return mimeType;
  }
}
