import { describe, expect, it } from "vitest";
import type { CollectionRequestedItem } from "../../src/lib/collection/collection.application";
import {
  inferredCollectionItem,
  compatibleCollectionItems,
  collectionFileIdentity,
  collectionSourceTitle,
  collectionRetryable,
  collectionFailureCode,
  resolveCollectionCorrection,
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
  it("excludes explicitly read-only history items without denying ordinary optional requests", () => {
    const optional = { ...item("optional", "DOCUMENT"), required: false };
    const historical = {
      ...item("history", "DOCUMENT", true),
      required: false,
      uploadAllowed: false,
    };
    expect(
      compatibleCollectionItems([optional, historical], "DOCUMENT"),
    ).toEqual([optional]);
    expect(
      inferredCollectionItem(
        [item("current", "DOCUMENT", true), historical],
        "DOCUMENT",
      ),
    ).toBe("current");
  });
  it.each([
    "UPLOAD_INTERRUPTED",
    "UPLOAD_FAILED",
    "FINALIZE_FAILED",
    "RIGHTS_REQUIRED",
  ])("allows a recoverable %s retry", (code) => {
    expect(collectionRetryable(code)).toBe(true);
  });
  it.each([
    "CHECKSUM_MISMATCH",
    "DUPLICATE_FILE",
    "FILE_TOO_LARGE",
    "RIGHTS_REJECTED",
    "VALIDATION_REJECTED",
    "CORRECTION_STALE",
    "CAMPAIGN_UNAVAILABLE",
    null,
  ])("denies blind retry for %s", (code) => {
    expect(collectionRetryable(code)).toBe(false);
  });
  it("preserves safe rejection categories without exposing unknown diagnostics", () => {
    for (const code of [
      "CHECKSUM_MISMATCH",
      "DUPLICATE_FILE",
      "FILE_TOO_LARGE",
      "RIGHTS_REJECTED",
      "VALIDATION_REJECTED",
      "CORRECTION_STALE",
    ])
      expect(collectionFailureCode(code, false, false)).toBe(code);
    expect(
      collectionFailureCode("untrusted diagnostic detail", false, false),
    ).toBe("UPLOAD_FAILED");
    expect(
      collectionFailureCode("untrusted diagnostic detail", true, false),
    ).toBe("FINALIZE_FAILED");
    expect(collectionFailureCode("CHECKSUM_MISMATCH", false, true)).toBe(
      "UPLOAD_INTERRUPTED",
    );
  });
  it("binds a correction to the exact current required request and submission", () => {
    const requested = {
      ...item("pdf", "DOCUMENT", true),
      latestSubmission: {
        id: "previous",
        sourceName: "Prior",
        createdAt: "2026-09-20",
        status: "NEEDS_INFORMATION" as const,
        correction: {
          action: "FIX_INFORMATION" as const,
          reasonEn: "Add source context.",
          reasonAr: "أضف وصف المصدر.",
        },
      },
    };
    const campaign = {
      id: "campaign",
      name: "Campaign",
      cohortName: "Cohort",
      opensAt: "2026-09-01",
      closesAt: "2026-10-12",
      assignmentExpiresAt: "2026-10-10",
      requestedItems: [requested],
    };
    expect(resolveCollectionCorrection(campaign, "pdf", "previous")).toBe(
      requested,
    );
    expect(
      resolveCollectionCorrection(campaign, "other", "previous"),
    ).toBeNull();
    expect(resolveCollectionCorrection(campaign, "pdf", "stale")).toBeNull();
    for (const requestedItems of [
      [{ ...requested, required: false }],
      [
        {
          ...requested,
          latestSubmission: {
            ...requested.latestSubmission,
            status: "RECEIVED" as const,
          },
        },
      ],
      [
        {
          ...requested,
          latestSubmission: {
            ...requested.latestSubmission,
            correction: {
              ...requested.latestSubmission.correction,
              action: "REPLACE_FILE" as const,
            },
          },
        },
      ],
      [item("pdf", "DOCUMENT", true)],
    ])
      expect(
        resolveCollectionCorrection(
          { ...campaign, requestedItems },
          "pdf",
          "previous",
        ),
      ).toBeNull();
    const rejected = {
      ...requested,
      latestSubmission: {
        ...requested.latestSubmission,
        status: "REJECTED" as const,
        correction: {
          ...requested.latestSubmission.correction,
          action: "REPLACE_FILE" as const,
        },
      },
    };
    expect(
      resolveCollectionCorrection(
        { ...campaign, requestedItems: [rejected] },
        "pdf",
        "previous",
      ),
    ).toBe(rejected);
  });
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
