import { describe, expect, it } from "vitest";
import {
  additionalCampaignIds,
  assignedSyntheticCampaigns,
  createSyntheticCollectionMemory,
  demoCampaignId,
  finalizeSyntheticCollectionSubmission,
  makeSyntheticCampaign,
  prepareSyntheticCollectionCorrections,
  registerSyntheticCollectionReceipt,
} from "../../src/lib/demo/synthetic-campaigns.application";
import type { ReviewSubmission } from "../../src/lib/demo/synthetic-fixtures.application";

type CollectionState = {
  role: string;
  verified: boolean;
  consent: boolean;
  campaignDensity: boolean;
  submissions: ReviewSubmission[];
};
type Memory = ReturnType<typeof createSyntheticCollectionMemory>;

const state = (): CollectionState => ({
  role: "leader",
  verified: true,
  consent: true,
  campaignDensity: true,
  submissions: [],
});
const target = (campaignId: string) =>
  makeSyntheticCampaign(state(), "en", campaignId)!.requestedItems[0]!.id;

function prepared(campaignId = demoCampaignId) {
  const current = state();
  const memory = createSyntheticCollectionMemory();
  const key = "synthetic-client-key-001";
  const receipt = registerSyntheticCollectionReceipt(
    current,
    memory,
    campaignId,
    target(campaignId),
    key,
    "application/pdf",
    128,
  );
  const data = new FormData();
  for (const [field, value] of Object.entries({
    campaignId,
    requestedItemId: target(campaignId),
    clientIdempotencyKey: key,
    uploadId: receipt.uploadId,
    sourceName: "Synthetic study source",
    sourceDescription: "Synthetic description with ordinary safe metadata.",
    declaredRights: "DECLARED",
  }))
    data.set(field, value);
  return { current, memory, data };
}

function preparedCorrection() {
  const setup = prepared();
  setup.current.submissions = prepareSyntheticCollectionCorrections(
    setup.current,
    demoCampaignId,
    "corrections",
  );
  const memory = createSyntheticCollectionMemory();
  const receipt = registerSyntheticCollectionReceipt(
    setup.current,
    memory,
    demoCampaignId,
    "sample-item-1",
    String(setup.data.get("clientIdempotencyKey")),
    "application/pdf",
    128,
    { submissionId: "-201", action: "FIX_INFORMATION" },
  );
  setup.data.set("uploadId", receipt.uploadId);
  setup.data.set("replacesSubmissionId", "-201");
  setup.data.set("correctionAction", "FIX_INFORMATION");
  return { ...setup, memory };
}

function copyWith(data: FormData, field: string, value: string) {
  const copy = new FormData();
  for (const [name, entry] of data) copy.set(name, entry);
  copy.set(field, value);
  return copy;
}

function finalize(
  current: CollectionState,
  memory: Memory,
  campaignId: string,
  data: FormData,
) {
  return finalizeSyntheticCollectionSubmission(
    current,
    memory,
    campaignId,
    data,
  );
}

function deny(current: CollectionState, denial: string) {
  if (denial === "unverified") current.verified = false;
  else if (denial === "no-consent") current.consent = false;
  else if (denial === "unprepared") current.campaignDensity = false;
  else current.role = denial;
}

const denials = [
  "student",
  "admin",
  "second-admin",
  "unverified",
  "no-consent",
  "unprepared",
];

describe("document-local collection finalization", () => {
  it("rejects stale receipt-bearing corrections while permitting an exact finalized replay", () => {
    const setup = preparedCorrection();
    const prior = [...setup.current.submissions];
    setup.current.submissions.push({
      id: 41,
      campaignId: demoCampaignId,
      requestedItemId: "sample-item-1",
      format: "DOCUMENT",
      status: "RECEIVED",
    });
    expect(
      finalize(setup.current, setup.memory, demoCampaignId, setup.data).result
        .status,
    ).toBe("ERROR");
    const omitted = new FormData();
    for (const [name, value] of setup.data)
      if (name !== "replacesSubmissionId" && name !== "correctionAction")
        omitted.set(name, value);
    expect(
      finalize(setup.current, setup.memory, demoCampaignId, omitted).result
        .status,
    ).toBe("ERROR");
    expect(() =>
      registerSyntheticCollectionReceipt(
        setup.current,
        setup.memory,
        demoCampaignId,
        "sample-item-1",
        String(setup.data.get("clientIdempotencyKey")),
        "application/pdf",
        128,
      ),
    ).toThrow("VALIDATION_REJECTED");
    setup.current.submissions = prior;
    const received = finalize(
      setup.current,
      setup.memory,
      demoCampaignId,
      setup.data,
    );
    expect(received.result.status).toBe("SUCCESS");
    // The earlier rejections neither consumed the receipt nor recorded a replay.
    expect(received.submission).toEqual(
      expect.objectContaining({ requestedItemId: "sample-item-1" }),
    );
    setup.current.submissions.push(received.submission!);
    const replay = finalize(
      setup.current,
      setup.memory,
      demoCampaignId,
      setup.data,
    );
    expect(replay.result).toEqual(received.result);
    expect(replay.submission).toBeUndefined();
    setup.data.set("correctionAction", "REPLACE_FILE");
    expect(
      finalize(setup.current, setup.memory, demoCampaignId, setup.data).result
        .status,
    ).toBe("ERROR");
  });

  it("rejects same-ID status/action changes and optional historical corrections at finalization", () => {
    const setup = preparedCorrection();
    const original = setup.current.submissions[0]!;
    setup.current.submissions[0] = {
      ...original,
      status: "REJECTED",
      correction: {
        action: "REPLACE_FILE",
        reasonEn: "Different file required.",
        reasonAr: "يلزم ملف آخر.",
      },
    };
    expect(
      finalize(setup.current, setup.memory, demoCampaignId, setup.data).result
        .status,
    ).toBe("ERROR");
    const historical = copyWith(
      copyWith(setup.data, "requestedItemId", "sample-history-1"),
      "replacesSubmissionId",
      "history-1",
    );
    expect(
      finalize(setup.current, setup.memory, demoCampaignId, historical).result
        .status,
    ).toBe("ERROR");
    setup.current.submissions[0] = original;
    const received = finalize(
      setup.current,
      setup.memory,
      demoCampaignId,
      setup.data,
    );
    expect(received.result.status).toBe("SUCCESS");
    expect(received.submission).toBeDefined();
  });

  it("accepts same-format files independently and projects only the exact latest request", () => {
    const current = state();
    const memory = createSyntheticCollectionMemory();
    for (const campaignId of [demoCampaignId, ...additionalCampaignIds]) {
      const setup = prepared(campaignId);
      const receipt = registerSyntheticCollectionReceipt(
        current,
        memory,
        campaignId,
        target(campaignId),
        String(setup.data.get("clientIdempotencyKey")),
        "application/pdf",
        128,
      );
      setup.data.set("uploadId", receipt.uploadId);
      const outcome = finalize(current, memory, campaignId, setup.data);
      expect(outcome.result.status).toBe("SUCCESS");
      current.submissions.push(outcome.submission!);
      expect(outcome.submission!.campaignId).toBe(campaignId);
      expect(outcome.submission!.requestedItemId).toBe(target(campaignId));
    }
    expect(new Set(current.submissions.map((row) => row.id)).size).toBe(3);
    for (const campaign of assignedSyntheticCampaigns(current, "en")) {
      expect(
        campaign.requestedItems.filter(
          (row) => row.required && row.latestSubmission,
        ),
      ).toHaveLength(1);
      expect(campaign.requestedItems[0]!.latestSubmission?.id).toBe(
        String(
          current.submissions.find((row) => row.campaignId === campaign.id)!.id,
        ),
      );
    }
  });

  it.each([
    "campaignId",
    "requestedItemId",
    "uploadId",
    "clientIdempotencyKey",
  ])("rejects a forged %s before finalization", (field) => {
    const { current, memory, data } = prepared();
    const forged = copyWith(
      data,
      field,
      field === "campaignId"
        ? additionalCampaignIds[0]
        : "invented-foreign-target",
    );
    expect(
      finalize(current, memory, demoCampaignId, forged).result.status,
    ).toBe("ERROR");
    expect(current.submissions).toHaveLength(0);
    const received = finalize(current, memory, demoCampaignId, data);
    expect(received.result.status).toBe("SUCCESS");
    expect(received.submission).toBeDefined();
  });

  it("rejects a foreign receipt even when campaign and request fields agree", () => {
    const { current, memory, data } = prepared();
    const foreign = copyWith(
      copyWith(data, "campaignId", additionalCampaignIds[0]),
      "requestedItemId",
      target(additionalCampaignIds[0]),
    );
    for (let attempt = 0; attempt < 2; attempt += 1)
      expect(
        finalize(current, memory, additionalCampaignIds[0], foreign).result
          .status,
      ).toBe("ERROR");
    expect(
      finalize(current, memory, demoCampaignId, data).submission,
    ).toBeDefined();
  });

  it("replays exactly once across view remounts without a second submission", () => {
    const { current, memory, data } = prepared();
    const first = finalize(current, memory, demoCampaignId, data);
    current.submissions.push(first.submission!);
    for (let remount = 0; remount < 2; remount += 1) {
      const replay = finalize(current, memory, demoCampaignId, data);
      expect(replay.result).toEqual(first.result);
      expect(replay.submission).toBeUndefined();
    }
    expect(current.submissions).toHaveLength(1);
  });

  it.each([
    "campaignId",
    "requestedItemId",
    "uploadId",
    "clientIdempotencyKey",
    "sourceName",
    "sourceDescription",
    "declaredRights",
  ])("rejects changed %s on replay", (field) => {
    const { current, memory, data } = prepared();
    const first = finalize(current, memory, demoCampaignId, data);
    current.submissions.push(first.submission!);
    const changed = copyWith(
      data,
      field,
      field === "sourceDescription"
        ? "Changed synthetic metadata after finalization."
        : "foreign-or-revoked",
    );
    expect(
      finalize(current, memory, demoCampaignId, changed).result.status,
    ).toBe("ERROR");
    expect(current.submissions).toHaveLength(1);
    const replay = finalize(current, memory, demoCampaignId, data);
    expect(replay.result).toEqual(first.result);
    expect(replay.submission).toBeUndefined();
  });

  it.each(denials)(
    "denies %s before registration and finalization",
    (denial) => {
      const { current, memory, data } = prepared(additionalCampaignIds[0]);
      deny(current, denial);
      expect(() =>
        registerSyntheticCollectionReceipt(
          current,
          memory,
          additionalCampaignIds[0],
          target(additionalCampaignIds[0]),
          "synthetic-key",
          "application/pdf",
          128,
        ),
      ).toThrow("VALIDATION_REJECTED");
      expect(
        finalize(current, memory, additionalCampaignIds[0], data).result.status,
      ).toBe("ERROR");
    },
  );

  it.each(denials)("revoked %s cannot replay a prior success", (denial) => {
    const { current, memory, data } = prepared(additionalCampaignIds[0]);
    const first = finalize(current, memory, additionalCampaignIds[0], data);
    expect(first.result.status).toBe("SUCCESS");
    current.submissions.push(first.submission!);
    deny(current, denial);
    expect(
      finalize(current, memory, additionalCampaignIds[0], data).result.status,
    ).toBe("ERROR");
    expect(current.submissions).toHaveLength(1);
    Object.assign(current, {
      role: "leader",
      verified: true,
      consent: true,
      campaignDensity: true,
    });
    const restored = finalize(current, memory, additionalCampaignIds[0], data);
    expect(restored.result).toEqual(first.result);
    expect(restored.submission).toBeUndefined();
  });
});
