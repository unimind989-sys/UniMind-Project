import type { CollectionRequestedItem } from "./collection.application";
import type { CollectionExpectedType } from "./collection.domain";

// This is a draft convenience. The server reauthorizes the chosen item.
export function compatibleCollectionItems(
  items: readonly CollectionRequestedItem[],
  type: CollectionExpectedType,
) {
  return items.filter(
    (item) => item.expectedType === type || item.expectedType === "OTHER",
  );
}

export function inferredCollectionItem(
  items: readonly CollectionRequestedItem[],
  type: CollectionExpectedType,
): string | null {
  const compatible = compatibleCollectionItems(items, type);
  const outstanding = compatible.filter(
    (item) => item.status === "REQUESTED" && !item.latestSubmission,
  );
  const choices = outstanding.length ? outstanding : compatible;
  return choices.length === 1 ? choices[0]!.id : null;
}

export function collectionFileIdentity(file: {
  name: string;
  size: number;
  lastModified: number;
}) {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

export function collectionSourceTitle(name: string) {
  return name
    .replace(/\.(pdf|wav|png)$/iu, "")
    .trim()
    .slice(0, 200);
}
