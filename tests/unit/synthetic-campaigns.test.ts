import { describe, expect, it } from "vitest";
import {
  additionalCampaignIds,
  assignedSyntheticCampaigns,
  createSyntheticCollectionMemory,
  demoCampaignId,
  finalizeSyntheticCollectionSubmission,
  makeSyntheticCampaign,
  registerSyntheticCollectionReceipt,
  syntheticCampaignId,
  syntheticCampaignsManifest,
  prepareSyntheticCollectionCorrections,
} from "../../src/app/_components/synthetic-campaigns";
import type { ReviewSubmission } from "../../src/app/_components/synthetic-fixtures";

const state = () => ({
  role: "leader",
  verified: true,
  consent: true,
  campaignDensity: true,
  submissions: [] as ReviewSubmission[],
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
describe("document-local multi-campaign collection", () => {
  it("rejects stale receipt-bearing corrections while permitting an exact finalized replay", () => {
    const setup = preparedCorrection();
    setup.data.set("replacesSubmissionId", "-201");
    setup.data.set("correctionAction", "FIX_INFORMATION");
    const prior = [...setup.current.submissions];
    setup.current.submissions.push({
      id: 41,
      campaignId: demoCampaignId,
      requestedItemId: "sample-item-1",
      format: "DOCUMENT",
      status: "RECEIVED",
    });
    expect(
      finalizeSyntheticCollectionSubmission(
        setup.current,
        setup.memory,
        demoCampaignId,
        setup.data,
      ).result.status,
    ).toBe("ERROR");
    expect(setup.memory.finalized.size).toBe(0);
    expect(setup.memory.receipts.size).toBe(1);
    const omitted = new FormData();
    for (const [name, value] of setup.data)
      if (name !== "replacesSubmissionId" && name !== "correctionAction")
        omitted.set(name, value);
    expect(
      finalizeSyntheticCollectionSubmission(
        setup.current,
        setup.memory,
        demoCampaignId,
        omitted,
      ).result.status,
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
    const received = finalizeSyntheticCollectionSubmission(
      setup.current,
      setup.memory,
      demoCampaignId,
      setup.data,
    );
    expect(received.result.status).toBe("SUCCESS");
    setup.current.submissions.push(received.submission!);
    const replay = finalizeSyntheticCollectionSubmission(
      setup.current,
      setup.memory,
      demoCampaignId,
      setup.data,
    );
    expect(replay.result).toEqual(received.result);
    expect(replay.submission).toBeUndefined();
    setup.data.set("correctionAction", "REPLACE_FILE");
    expect(
      finalizeSyntheticCollectionSubmission(
        setup.current,
        setup.memory,
        demoCampaignId,
        setup.data,
      ).result.status,
    ).toBe("ERROR");
  });
  it("rejects same-ID status/action changes and optional historical corrections at finalization", () => {
    const setup = preparedCorrection();
    setup.data.set("replacesSubmissionId", "-201");
    setup.data.set("correctionAction", "FIX_INFORMATION");
    setup.current.submissions[0] = {
      ...setup.current.submissions[0]!,
      status: "REJECTED",
      correction: {
        action: "REPLACE_FILE",
        reasonEn: "Different file required.",
        reasonAr: "يلزم ملف آخر.",
      },
    };
    expect(
      finalizeSyntheticCollectionSubmission(
        setup.current,
        setup.memory,
        demoCampaignId,
        setup.data,
      ).result.status,
    ).toBe("ERROR");
    setup.data.set("requestedItemId", "sample-history-1");
    setup.data.set("replacesSubmissionId", "history-1");
    expect(
      finalizeSyntheticCollectionSubmission(
        setup.current,
        setup.memory,
        demoCampaignId,
        setup.data,
      ).result.status,
    ).toBe("ERROR");
    expect(setup.memory.finalized.size).toBe(0);
  });
  it("prepares permitted corrections only on exact local required requests and preserves first uploads", () => {
    const current = state();
    expect(
      prepareSyntheticCollectionCorrections(current, demoCampaignId, ""),
    ).toEqual([]);
    const corrections = prepareSyntheticCollectionCorrections(
      current,
      demoCampaignId,
      "corrections",
    );
    expect(corrections.map((row) => [row.requestedItemId, row.status])).toEqual(
      [
        ["sample-item-1", "NEEDS_INFORMATION"],
        ["sample-item-2", "REJECTED"],
      ],
    );
    current.submissions = corrections;
    const campaign = makeSyntheticCampaign(current, "en")!;
    expect(
      campaign.requestedItems[0]!.latestSubmission!.correction!.action,
    ).toBe("FIX_INFORMATION");
    expect(
      campaign.requestedItems[1]!.latestSubmission!.correction!.action,
    ).toBe("REPLACE_FILE");
    expect(campaign.requestedItems[2]!.latestSubmission).toBeNull();
    expect(
      prepareSyntheticCollectionCorrections(
        current,
        demoCampaignId,
        "corrections",
      ),
    ).toEqual([]);
    current.submissions.push({
      id: 1,
      requestedItemId: "sample-item-1",
      campaignId: demoCampaignId,
      format: "DOCUMENT",
      status: "RECEIVED",
    });
    expect(
      makeSyntheticCampaign(current, "en")!.requestedItems[0]!.latestSubmission!
        .id,
    ).toBe("1");
    expect(
      prepareSyntheticCollectionCorrections(
        current,
        demoCampaignId,
        "corrections",
      ),
    ).toEqual([]);
  });
  it("denies correction preparation to wrong role, access state and campaign", () => {
    for (const current of [
      { ...state(), role: "student" },
      { ...state(), verified: false },
      { ...state(), consent: false },
    ])
      expect(
        prepareSyntheticCollectionCorrections(
          current,
          demoCampaignId,
          "corrections",
        ),
      ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(
        state(),
        additionalCampaignIds[0],
        "corrections",
      ),
    ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(state(), "unknown", "corrections"),
    ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(
        state(),
        demoCampaignId,
        "duplicate",
      ),
    ).toEqual([
      expect.objectContaining({
        requestedItemId: "sample-item-1",
        status: "RECEIVED",
      }),
    ]);
  });
  it("preserves the ordinary single campaign and creates exact distinct prepared assignments", () => {
    const current = state();
    expect(
      assignedSyntheticCampaigns(
        { ...current, campaignDensity: false },
        "en",
      ).map((row) => row.id),
    ).toEqual([demoCampaignId]);
    const campaigns = assignedSyntheticCampaigns(current, "en");
    expect(campaigns).toHaveLength(3);
    const requests = campaigns.flatMap((campaign) =>
      campaign.requestedItems.filter((row) => row.required),
    );
    expect(requests).toHaveLength(9);
    expect(new Set(requests.map((row) => row.id)).size).toBe(9);
    expect(makeSyntheticCampaign(current, "en", "unassigned")).toBeNull();
    expect(syntheticCampaignsManifest().campaignIds).toEqual(
      campaigns.map((row) => row.id),
    );
    expect(
      assignedSyntheticCampaigns(current, "ar")[0]!
        .requestedItems.slice(0, 3)
        .map((row) => row.title),
    ).toEqual(["ملزمة التشريح", "تسجيل تشريح", "رسم تشريح"]);
    expect(
      assignedSyntheticCampaigns(current, "ar")[2]!.name.length,
    ).toBeGreaterThan(80);
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
      const outcome = finalizeSyntheticCollectionSubmission(
        current,
        memory,
        campaignId,
        setup.data,
      );
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
    data.set(
      field,
      field === "campaignId"
        ? additionalCampaignIds[0]
        : "invented-foreign-target",
    );
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        demoCampaignId,
        data,
      ).result.status,
    ).toBe("ERROR");
    expect(memory.finalized.size).toBe(0);
    expect(current.submissions).toHaveLength(0);
    expect(memory.receipts.size).toBe(1);
  });
  it("rejects a foreign receipt even when campaign and request fields agree", () => {
    const { current, memory, data } = prepared();
    data.set("campaignId", additionalCampaignIds[0]);
    data.set("requestedItemId", target(additionalCampaignIds[0]));
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        additionalCampaignIds[0],
        data,
      ).result.status,
    ).toBe("ERROR");
    expect(memory.finalized.size).toBe(0);
  });
  it("replays exactly once across view remounts without a second submission", () => {
    const { current, memory, data } = prepared();
    const first = finalizeSyntheticCollectionSubmission(
      current,
      memory,
      demoCampaignId,
      data,
    );
    current.submissions.push(first.submission!);
    const replay = finalizeSyntheticCollectionSubmission(
      current,
      memory,
      demoCampaignId,
      data,
    );
    expect(replay.result).toEqual(first.result);
    expect(replay.submission).toBeUndefined();
    expect(memory.receipts.size).toBe(0);
    expect(memory.finalized.size).toBe(1);
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
    const first = finalizeSyntheticCollectionSubmission(
      current,
      memory,
      demoCampaignId,
      data,
    );
    current.submissions.push(first.submission!);
    data.set(
      field,
      field === "sourceDescription"
        ? "Changed synthetic metadata after finalization."
        : "foreign-or-revoked",
    );
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        demoCampaignId,
        data,
      ).result.status,
    ).toBe("ERROR");
    expect(current.submissions).toHaveLength(1);
    expect(memory.finalized.size).toBe(1);
  });
  it.each([
    "student",
    "admin",
    "second-admin",
    "unverified",
    "no-consent",
    "unprepared",
  ])("denies %s before registration and finalization", (denial) => {
    const { current, memory, data } = prepared(additionalCampaignIds[0]);
    if (denial === "unverified") current.verified = false;
    else if (denial === "no-consent") current.consent = false;
    else if (denial === "unprepared") current.campaignDensity = false;
    else current.role = denial;
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
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        additionalCampaignIds[0],
        data,
      ).result.status,
    ).toBe("ERROR");
  });
  it.each([
    "student",
    "admin",
    "second-admin",
    "unverified",
    "no-consent",
    "unprepared",
  ])("revoked %s cannot replay a prior success", (denial) => {
    const { current, memory, data } = prepared(additionalCampaignIds[0]);
    const first = finalizeSyntheticCollectionSubmission(
      current,
      memory,
      additionalCampaignIds[0],
      data,
    );
    expect(first.result.status).toBe("SUCCESS");
    current.submissions.push(first.submission!);
    if (denial === "unverified") current.verified = false;
    else if (denial === "no-consent") current.consent = false;
    else if (denial === "unprepared") current.campaignDensity = false;
    else current.role = denial;
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        additionalCampaignIds[0],
        data,
      ).result.status,
    ).toBe("ERROR");
    expect(current.submissions).toHaveLength(1);
    expect(memory.finalized.size).toBe(1);
  });

  it("retains distinct document-owned draft handles and clears all collection state", () => {
    const { memory } = prepared();
    memory
      .draft(demoCampaignId)
      .save({ files: [], description: "Synthetic A draft", rights: true });
    memory
      .draft(additionalCampaignIds[0])
      .save({ files: [], description: "Synthetic B draft", rights: false });
    expect(memory.draft(demoCampaignId).current?.description).toBe(
      "Synthetic A draft",
    );
    expect(memory.draft(additionalCampaignIds[0]).current?.rights).toBe(false);
    const generation = memory.generation;
    memory.clear();
    expect(memory.drafts.size).toBe(0);
    expect(memory.receipts.size).toBe(0);
    expect(memory.finalized.size).toBe(0);
    expect(memory.generation).toBe(generation + 1);
    expect(memory.draft(demoCampaignId).current).toBeUndefined();
  });
  it.each([
    "/batch-leader/campaigns/unassigned",
    "/batch-leader/campaigns/sample-campaign/extra",
    "//batch-leader/campaigns/sample-campaign",
    "/admin/sample-campaign",
  ])("rejects unknown or ambiguous campaign path %s", (path) => {
    expect(syntheticCampaignId(path)).toBeNull();
  });
});
