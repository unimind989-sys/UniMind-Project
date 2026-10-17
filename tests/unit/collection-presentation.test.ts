import { describe, expect, it } from "vitest";
import type {
  CollectionCampaign,
  CollectionRequestedItem,
} from "../../src/lib/collection/collection.application";
import { boundCollectionItem } from "../../src/lib/collection/collection-queue.application";
import {
  collectionDeadline,
  collectionWindow,
  collectionRequestAction,
  collectionRequestProgress,
  collectionInspectionHref,
  resolveCollectionInspection,
  resolveCollectionUploadSelection,
  projectCollectionRecords,
} from "../../src/lib/collection/collection-presentation.application";
const item: CollectionRequestedItem = {
  id: "request",
  unitId: "unit",
  title: "Handout",
  unitTitleEn: "Anatomy",
  unitTitleAr: "التشريح",
  expectedType: "DOCUMENT",
  required: true,
  status: "REQUESTED",
  latestSubmission: null,
};
const record = {
  id: "record",
  sourceName: "Prior",
  status: "PROCESSING" as const,
  createdAt: "2026-10-01T12:00:00Z",
};
const campaign: CollectionCampaign = {
  id: "campaign",
  name: "Call",
  cohortName: "Cohort",
  opensAt: "2026-10-01T00:00:00Z",
  assignmentExpiresAt: "2026-10-10T20:00:00Z",
  closesAt: "2026-10-12T20:00:00Z",
  requestedItems: [item],
};
const recorded = {
  ...campaign,
  requestedItems: [
    { ...item, status: "RECEIVED" as const, latestSubmission: record },
  ],
};
const ack = {
  itemId: item.id,
  submissionId: "new-record",
  fileName: "source.pdf",
  title: "Captured title",
  description: "Captured permitted source description",
  origin: "DEVICE" as const,
};
describe("collection request presentation", () => {
  it("uses the earlier personal/campaign cutoff and fails closed on malformed dates", () => {
    expect(collectionDeadline(campaign)).toBe(
      campaign.assignmentExpiresAt.replace("Z", ".000Z"),
    );
    expect(
      collectionDeadline({ ...campaign, closesAt: "2026-10-05T20:00:00Z" }),
    ).toBe("2026-10-05T20:00:00.000Z");
    expect(
      collectionDeadline({ ...campaign, assignmentExpiresAt: "invalid" }),
    ).toBeNull();
  });
  it.each([
    ["2026-09-30T23:59:00Z", "NOT_OPEN"],
    ["2026-10-01T00:00:00Z", "ACTIVE"],
    ["2026-10-10T20:00:00Z", "EXPIRED"],
    ["2026-10-12T20:00:00Z", "CLOSED"],
  ])("classifies boundary %s without granting actions", (time, status) =>
    expect(collectionWindow(campaign, Date.parse(time))).toBe(status),
  );
  it("rejects invalid clock/campaign inputs", () => {
    expect(collectionWindow(campaign, NaN)).toBe("UNAVAILABLE");
    expect(collectionWindow({ ...campaign, closesAt: "bad" }, 0)).toBe(
      "UNAVAILABLE",
    );
  });
  it("does not turn read-only or unactionable status examples into work", () => {
    expect(collectionRequestAction(campaign, item)).toBe("UPLOAD");
    expect(
      collectionRequestAction(campaign, { ...item, uploadAllowed: false }),
    ).toBeNull();
    expect(
      collectionRequestAction(recorded, recorded.requestedItems[0]!),
    ).toBeNull();
    const correction = {
      ...item,
      status: "RECEIVED" as const,
      latestSubmission: {
        ...record,
        status: "NEEDS_INFORMATION" as const,
        correction: {
          action: "FIX_INFORMATION" as const,
          reasonEn: "Chapter",
          reasonAr: "الفصل",
        },
      },
    };
    expect(
      collectionRequestAction(
        { ...campaign, requestedItems: [correction] },
        correction,
      ),
    ).toBe("FIX_INFORMATION");
    expect(
      collectionRequestAction(
        { ...campaign, requestedItems: [{ ...correction, required: false }] },
        { ...correction, required: false },
      ),
    ).toBeNull();
  });
  it("binds named rows without falling back to another compatible request", () => {
    const alternatives = [item, { ...item, id: "alternative" }];
    expect(
      boundCollectionItem(alternatives, "request", "DOCUMENT").item?.id,
    ).toBe("request");
    expect(boundCollectionItem(alternatives, "missing", "DOCUMENT").error).toBe(
      "ITEM_UNAVAILABLE",
    );
    expect(boundCollectionItem(alternatives, "request", "AUDIO").error).toBe(
      "TYPE_MISMATCH",
    );
    expect(
      boundCollectionItem(
        [{ ...item, uploadAllowed: false }],
        "request",
        "DOCUMENT",
      ).error,
    ).toBe("ITEM_UNAVAILABLE");
    expect(
      boundCollectionItem(recorded.requestedItems, "request", "DOCUMENT").error,
    ).toBe("ITEM_UNAVAILABLE");
  });
  it("opens an exact loaded record through a distinct read-only selector", () => {
    const url = new URL(
      collectionInspectionHref(campaign.id, item.id, record.id, "ar"),
      "https://local.invalid",
    );
    expect(resolveCollectionInspection(recorded, url.searchParams)).toEqual({
      status: "FOUND",
      item: recorded.requestedItems[0],
    });
    expect(url.searchParams.has("request")).toBe(false);
    expect(collectionInspectionHref("a/b", "x y", "r&z", "en")).toContain(
      "/batch-leader/campaigns/a%2Fb?",
    );
  });
  it.each([
    "inspect=request",
    "record=record",
    "inspect=request&record=stale",
    "inspect=foreign&record=record",
    "inspect=request&record=record&record=record",
    "inspect=request&inspect=request&record=record",
    "inspect=request&record=record&request=request&submission=record",
    "inspect=request&record=record&upload=all",
    "inspect=&record=record",
  ])("rejects stale/foreign/duplicate/mixed inspection %s", (query) =>
    expect(
      resolveCollectionInspection(recorded, new URLSearchParams(query)),
    ).toEqual({ status: "UNAVAILABLE" }),
  );
  it("ordinary correction selectors remain outside inspection", () =>
    expect(
      resolveCollectionInspection(
        campaign,
        new URLSearchParams("request=request&submission=record"),
      ),
    ).toEqual({ status: "NONE" }));
  it("opens bulk or one permitted missing request without creating an upload", () => {
    expect(
      resolveCollectionUploadSelection(
        campaign,
        new URLSearchParams("upload=all"),
      ),
    ).toEqual({ status: "FOUND", itemId: null });
    expect(
      resolveCollectionUploadSelection(
        campaign,
        new URLSearchParams("upload=request"),
      ),
    ).toEqual({ status: "FOUND", itemId: "request" });
  });
  it.each([
    "upload=foreign",
    "upload=request&upload=request",
    "upload=request&inspect=request&record=record",
    "upload=all&request=request&submission=record",
    "upload=",
  ])("rejects ambiguous upload intent %s", (query) =>
    expect(
      resolveCollectionUploadSelection(campaign, new URLSearchParams(query)),
    ).toEqual({ status: "UNAVAILABLE" }),
  );
  it("a completed/read-only request cannot become a fresh named upload", () => {
    expect(
      resolveCollectionUploadSelection(
        recorded,
        new URLSearchParams("upload=request"),
      ),
    ).toEqual({ status: "UNAVAILABLE" });
    expect(
      resolveCollectionUploadSelection(
        { ...campaign, requestedItems: [{ ...item, uploadAllowed: false }] },
        new URLSearchParams("upload=request"),
      ),
    ).toEqual({ status: "UNAVAILABLE" });
  });
  it("projects an acknowledged first receipt without inventing a server date", () => {
    const p = projectCollectionRecords(campaign, [ack]);
    expect(p.campaign.requestedItems[0]?.latestSubmission).toMatchObject({
      id: "new-record",
      sourceName: ack.title,
      createdAt: "",
      status: "RECEIVED",
    });
    expect(p.details.get(item.id)).toEqual(ack);
    expect(p.unresolved).toEqual([]);
    expect(campaign.requestedItems[0]?.latestSubmission).toBeNull();
  });
  it("suppresses only the known predecessor, never an unrelated loaded record", () => {
    const p = projectCollectionRecords(recorded, [
      { ...ack, predecessorId: record.id },
    ]);
    expect(p.campaign.requestedItems[0]?.latestSubmission?.id).toBe(
      ack.submissionId,
    );
    const unrelated = projectCollectionRecords(recorded, [
      { ...ack, predecessorId: "other" },
    ]);
    expect(unrelated.campaign).toEqual(recorded);
    expect(unrelated.details.size).toBe(0);
    expect(unrelated.unresolved).toHaveLength(1);
  });
  it("only enriches the same canonical ID and keeps authoritative processing state", () => {
    const p = projectCollectionRecords(recorded, [
      { ...ack, submissionId: record.id },
    ]);
    expect(p.campaign).toEqual(recorded);
    expect(p.details.get(item.id)?.title).toBe(ack.title);
    expect(p.details.get(item.id)?.origin).toBe("DEVICE");
  });
  it("suppresses only the retained predecessor chain proven by the exact loaded receipt", () => {
    const latest = { ...ack, submissionId: record.id, predecessorId: "older" };
    const older = { ...ack, submissionId: "older", predecessorId: "oldest" };
    const oldest = { ...ack, submissionId: "oldest" };
    const unknown = { ...ack, submissionId: "unrelated" };
    const p = projectCollectionRecords(recorded, [
      oldest,
      older,
      latest,
      unknown,
    ]);
    expect(p.campaign).toEqual(recorded);
    expect(p.details.get(item.id)).toEqual(latest);
    expect(p.unresolved).toEqual([unknown]);
    const ambiguous = projectCollectionRecords(recorded, [
      latest,
      older,
      older,
    ]);
    expect(ambiguous.unresolved).toEqual([older, older]);
  });
  it("missing IDs, duplicate acknowledgements and unknown requests do not fabricate a link", () => {
    const withoutId = {
      itemId: ack.itemId,
      fileName: ack.fileName,
      title: ack.title,
      description: ack.description,
    };
    for (const receipts of [
      [withoutId],
      [ack, { ...ack, submissionId: "another" }],
      [{ ...ack, itemId: "foreign" }],
      [
        { ...ack, submissionId: record.id },
        { ...ack, submissionId: record.id, title: "Conflicting" },
      ],
    ]) {
      const p = projectCollectionRecords(recorded, receipts);
      expect(p.campaign).toEqual(recorded);
      expect(p.details.size).toBe(0);
      expect(p.unresolved.length).toBe(receipts.length);
    }
  });
  it("derives request progress from requests the leader may upload to", () => {
    expect(collectionRequestProgress(campaign)).toEqual({ total: 1, sent: 0 });
    expect(collectionRequestProgress(recorded)).toEqual({ total: 1, sent: 1 });
    const correction = {
      ...recorded,
      requestedItems: [
        {
          ...recorded.requestedItems[0]!,
          latestSubmission: {
            ...record,
            status: "NEEDS_INFORMATION" as const,
            correction: {
              action: "FIX_INFORMATION" as const,
              reasonEn: "Describe the handout.",
              reasonAr: "صف الملزمة.",
            },
          },
        },
        { ...item, id: "archive", required: false, uploadAllowed: false },
      ],
    };
    // A requested correction still needs the leader; read-only rows never count.
    expect(collectionRequestProgress(correction)).toEqual({
      total: 1,
      sent: 0,
    });
  });
});
