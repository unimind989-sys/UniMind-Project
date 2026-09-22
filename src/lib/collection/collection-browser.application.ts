import {
  inspectCollectionFile,
  MAX_COLLECTION_FILE_BYTES,
} from "./collection.domain";

export const COLLECTION_BROWSER_MAX_FILE_BYTES = MAX_COLLECTION_FILE_BYTES;

export function inspectCollectionFileForBrowser(
  input: Parameters<typeof inspectCollectionFile>[0],
) {
  return inspectCollectionFile(input);
}
