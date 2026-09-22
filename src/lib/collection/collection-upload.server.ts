import "server-only";

import { DeterministicMockObjectStorageProvider } from "../storage/mocks/object-storage.mock.adapter";
import {
  prepareCollectionUpload,
  type CollectionRepository,
} from "./collection.application";

type PrepareInput = Parameters<typeof prepareCollectionUpload>[2];

export function prepareSyntheticCollectionUpload(
  repository: CollectionRepository,
  input: PrepareInput,
) {
  return prepareCollectionUpload(
    repository,
    new DeterministicMockObjectStorageProvider(),
    input,
  );
}
