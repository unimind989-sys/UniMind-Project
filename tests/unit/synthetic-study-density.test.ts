import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  prepareStudyDensity,
  studyDensityFixture,
  studyDensitySourceTitles,
  studyFixtureSourceCount,
  studyDensityManifest,
} from "../../src/lib/demo/synthetic-study-density.application";
import type { ReviewSession } from "../../src/lib/demo/synthetic-fixtures.application";

const state = () => ({
  studyDensityUnitId: null as string | null,
  sessions: [] as ReviewSession[],
  activeSessions: {} as Record<string, number>,
  sharing: "private" as const,
  role: "student",
  consent: false,
  verified: false,
  academicContext: null,
  chatDrafts: {
    "other:2": { message: "synthetic unsent draft", language: "mixed" },
  },
  availability: { published: true, unlocked: true, sourceActive: false },
});

describe("prepared study density", () => {
  it("publishes the runtime fixture manifest without changing the ordinary catalog", () => {
    const pack = JSON.parse(
      readFileSync("public/demo-files/test-data.json", "utf8"),
    );
    const path = pack.unitScopes.find(
      (row: { programEn: string }) => row.programEn === "Faculty of Medicine",
    ).path;
    expect(pack.preparedStudyDensity).toEqual(studyDensityManifest(path));
    expect(pack.preparedStudyDensity.localOnly).toBe(true);
    expect(
      pack.catalog.find(
        (row: { unit: { id: string } }) =>
          row.unit.id === path.split("/").at(-1),
      ).unit.sourceCount,
    ).toBe(8);
  });
  it("adds twelve deterministic sessions with exact per-exchange scope and privacy", () => {
    const prepared = prepareStudyDensity(
      state(),
      "authorized-sample-unit",
      "mixed",
    );
    expect(prepared.sessions).toHaveLength(12);
    expect(new Set(prepared.sessions.map((entry) => entry.id)).size).toBe(12);
    expect(prepared).toEqual(
      prepareStudyDensity(state(), "authorized-sample-unit", "mixed"),
    );
    expect(prepared.activeSessions).toEqual({ "authorized-sample-unit": 1 });
    for (const session of prepared.sessions) {
      expect(session.scope).toBe("authorized-sample-unit");
      expect(session.title?.[0].length).toBeGreaterThan(80);
      expect(session.title?.[1].length).toBeGreaterThan(60);
      expect(session.answers).toHaveLength(2);
      for (const answer of session.answers) {
        expect(answer.sessionId).toBe(session.id);
        expect(answer.sharing).toBe("private");
        expect(answer.language).toBe("mixed");
      }
    }
  });

  it("keeps existing records, active target, drafts, account and availability intact", () => {
    const prior = {
      ...state(),
      sessions: [
        { id: 20, scope: "authorized-sample-unit", answers: [] },
        { id: 42, scope: "another-unit", answers: [] },
      ],
      activeSessions: { "authorized-sample-unit": 20, "another-unit": 42 },
    };
    const snapshot = structuredClone(prior);
    const prepared = prepareStudyDensity(prior, "authorized-sample-unit", "ar");
    expect(prior).toEqual(snapshot);
    expect(prepared.sessions.slice(0, 2)).toEqual(prior.sessions);
    expect(prepared.sessions[2]?.id).toBe(43);
    expect(prepared.activeSessions).toEqual(prior.activeSessions);
    expect(prepared.chatDrafts).toBe(prior.chatDrafts);
    expect(prepared.availability).toBe(prior.availability);
    expect(prepared.role).toBe(prior.role);
    expect(prepared.consent).toBe(false);
    expect(prepared.verified).toBe(false);
    expect(prepared.academicContext).toBeNull();
  });

  it("never reseeds or replaces edits after the document has been prepared", () => {
    const prepared = prepareStudyDensity(
      state(),
      "authorized-sample-unit",
      "en",
    );
    const edited = {
      ...prepared,
      sharing: "shared" as const,
      sessions: [
        ...prepared.sessions,
        { id: 13, scope: "authorized-sample-unit", answers: [] },
      ],
    };
    expect(prepareStudyDensity(edited, "authorized-sample-unit", "ar")).toBe(
      edited,
    );
    expect(prepareStudyDensity(edited, "another-unit", "ar")).toBe(edited);
  });

  it("changes the prepared unit count alone and retains normal catalog counts", () => {
    const empty = state();
    expect(studyFixtureSourceCount(empty, "authorized-sample-unit", 8)).toBe(8);
    const prepared = prepareStudyDensity(empty, "authorized-sample-unit", "en");
    expect(studyFixtureSourceCount(prepared, "authorized-sample-unit", 8)).toBe(
      24,
    );
    expect(studyFixtureSourceCount(prepared, "other-unit", 11)).toBe(11);
    expect(studyFixtureSourceCount(prepared, "unavailable-unit", 0)).toBe(0);
  });

  it("provides 24 distinct bilingual titles while retaining the first two evidence identities", () => {
    expect(studyDensitySourceTitles).toHaveLength(
      studyDensityFixture.sourceCount,
    );
    expect(
      new Set(studyDensitySourceTitles.map((title) => title[0])).size,
    ).toBe(24);
    expect(
      new Set(studyDensitySourceTitles.map((title) => title[1])).size,
    ).toBe(24);
    expect(studyDensitySourceTitles.slice(0, 2)).toEqual([
      ["Synthetic sequence handout", "ملزمة الترتيب التجريبية"],
      ["Synthetic comparison recording", "تسجيل المقارنة التجريبي"],
    ]);
    for (const title of studyDensitySourceTitles.slice(2)) {
      expect(title[0].length).toBeGreaterThan(90);
      expect(title[1].length).toBeGreaterThan(65);
    }
  });
});
