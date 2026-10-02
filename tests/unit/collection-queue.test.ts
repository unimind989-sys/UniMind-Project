import { describe, expect, it } from "vitest";
import type { CollectionRequestedItem } from "../../src/lib/collection/collection.application";
import {
  inferredCollectionItem,
  compatibleCollectionItems,
  collectionFileIdentity,
  collectionSourceTitle,
} from "../../src/lib/collection/collection-queue.application";
const item = (
  id: string,
  type: CollectionRequestedItem["expectedType"],
  received = false,
): CollectionRequestedItem => ({
  id,
  unitId: "unit",
  title: id,
  unitTitleEn: "Unit",
  unitTitleAr: "وحدة",
  expectedType: type,
  required: true,
  status: received ? "RECEIVED" : "REQUESTED",
  latestSubmission: received
    ? {
        id: "previous",
        sourceName: "Prior",
        status: "PROCESSING",
        createdAt: "2026-09-20",
      }
    : null,
});
describe("collection queue destination convenience", () => {
  it("infers a unique outstanding request without classifying the source manually", () => {
    const items = [
      item("pdf", "DOCUMENT"),
      item("old", "DOCUMENT", true),
      item("wav", "AUDIO"),
      item("png", "IMAGE"),
    ];
    expect(inferredCollectionItem(items, "DOCUMENT")).toBe("pdf");
    expect(inferredCollectionItem(items, "AUDIO")).toBe("wav");
    expect(inferredCollectionItem(items, "IMAGE")).toBe("png");
  });
  it("requires a choice when more than one compatible request is outstanding", () =>
    expect(
      inferredCollectionItem(
        [item("a", "DOCUMENT"), item("b", "DOCUMENT")],
        "DOCUMENT",
      ),
    ).toBeNull());
  it("supports an untyped request and requires a choice when it is ambiguous", () => {
    expect(inferredCollectionItem([item("any", "OTHER")], "AUDIO")).toBe("any");
    expect(
      inferredCollectionItem(
        [item("any", "OTHER"), item("audio", "AUDIO")],
        "AUDIO",
      ),
    ).toBeNull();
  });
  it("keeps only compatible requests and does not invent a destination", () => {
    expect(
      compatibleCollectionItems(
        [item("a", "DOCUMENT"), item("b", "AUDIO")],
        "IMAGE",
      ),
    ).toEqual([]);
    expect(inferredCollectionItem([item("a", "DOCUMENT")], "IMAGE")).toBeNull();
  });
  it("offers a unique replacement but leaves multiple prior requests ambiguous", () => {
    expect(
      inferredCollectionItem([item("a", "DOCUMENT", true)], "DOCUMENT"),
    ).toBe("a");
    expect(
      inferredCollectionItem(
        [item("a", "DOCUMENT", true), item("b", "DOCUMENT", true)],
        "DOCUMENT",
      ),
    ).toBeNull();
  });
  it("keeps duplicate selection detection separate from server checksum authority", () => {
    const file = { name: "notes.pdf", size: 100, lastModified: 123 };
    expect(collectionFileIdentity(file)).toBe(
      collectionFileIdentity({ ...file }),
    );
    expect(collectionFileIdentity(file)).not.toBe(
      collectionFileIdentity({ ...file, lastModified: 124 }),
    );
    expect(collectionSourceTitle(" notes.PDF ".trim())).toBe("notes");
    expect(collectionSourceTitle("a".repeat(300) + ".pdf")).toHaveLength(200);
  });
});
