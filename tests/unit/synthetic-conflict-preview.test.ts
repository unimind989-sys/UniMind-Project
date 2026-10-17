import { describe, expect, it } from "vitest";
import {
  canReviewConflictPreview,
  reviewConflictPreview,
  type ConflictPreviewState,
} from "../../src/lib/demo/synthetic-conflict-preview.application";

function fixture(
  role: ConflictPreviewState["role"] = "admin",
): ConflictPreviewState & {
  chatDrafts: Record<string, { message: string; language: "mixed" }>;
} {
  return {
    role,
    availability: { unlocked: true, published: true, sourceActive: true },
    sessions: [],
    activeSessions: {},
    sharing: "shared",
    studyLanguage: null,
    qualityConflictSessionId: null,
    chatDrafts: {
      "ordinary:3": { message: "Unsent synthetic draft", language: "mixed" },
    },
  };
}

describe("fixed quality conflict preview", () => {
  it.each(["admin", "second-admin"] as const)(
    "lets %s inspect one prepared conflict",
    (role) => {
      const before = fixture(role);
      const next = reviewConflictPreview(before, "unit-a", "ar");
      expect(next.sessions).toEqual([
        {
          id: 1,
          scope: "unit-a",
          answers: [
            {
              kind: "conflict",
              promptKind: "conflict",
              language: "ar",
              sessionId: 1,
              sharing: "shared",
            },
          ],
        },
      ]);
      expect(next.activeSessions).toEqual({ "unit-a": 1 });
      expect(next.qualityConflictSessionId).toBe(1);
      expect(before.sessions).toEqual([]);
    },
  );

  it.each(["student", "leader", null] as const)(
    "does not prepare an example for role %s",
    (role) => {
      const before = fixture(role);
      expect(canReviewConflictPreview(before)).toBe(false);
      expect(reviewConflictPreview(before, "unit-a", "en")).toBe(before);
    },
  );

  it.each(["unlocked", "published", "sourceActive"] as const)(
    "does not bypass unavailable %s",
    (flag) => {
      const before = fixture();
      before.availability[flag] = false;
      expect(canReviewConflictPreview(before)).toBe(false);
      expect(reviewConflictPreview(before, "unit-a", "en")).toBe(before);
    },
  );

  it("keeps ordinary and other-unit records and drafts intact, and uses the selected output language", () => {
    const before = fixture();
    before.sessions = [
      {
        id: 3,
        scope: "unit-a",
        answers: [
          {
            kind: "supported",
            language: "en",
            sessionId: 3,
            sharing: "shared",
          },
        ],
      },
      { id: 7, scope: "unit-b", answers: [] },
    ];
    before.activeSessions = { "unit-a": 3, "unit-b": 7 };
    before.studyLanguage = "mixed";
    before.sharing = "private";
    const next = reviewConflictPreview(before, "unit-a", "ar");
    expect(next.sessions.slice(0, 2)).toEqual(before.sessions);
    expect(next.sessions[0]).toBe(before.sessions[0]);
    expect(next.sessions[1]).toBe(before.sessions[1]);
    expect(next.activeSessions).toEqual({ "unit-a": 8, "unit-b": 7 });
    expect(next.sessions[2]!.answers[0]).toMatchObject({
      language: "mixed",
      sharing: "private",
      sessionId: 8,
    });
    expect(next.chatDrafts).toBe(before.chatDrafts);
    expect(next.availability).toBe(before.availability);
  });

  it("reuses the same prepared session on repeated review and after selecting another session", () => {
    const first = reviewConflictPreview(fixture(), "unit-a", "en");
    expect(reviewConflictPreview(first, "unit-a", "ar")).toBe(first);
    const another = { ...first, activeSessions: { "unit-a": 9 } };
    const reviewed = reviewConflictPreview(another, "unit-a", "ar");
    expect(reviewed.sessions).toBe(first.sessions);
    expect(reviewed.sessions).toHaveLength(1);
    expect(reviewed.activeSessions["unit-a"]).toBe(1);
    expect(reviewed.sessions[0]!.answers[0]!.language).toBe("en");
  });

  it("never reuses a pointer to a different unit", () => {
    const before = reviewConflictPreview(fixture(), "unit-b", "en");
    const next = reviewConflictPreview(before, "unit-a", "ar");
    expect(next.sessions).toHaveLength(2);
    expect(next.activeSessions).toEqual({ "unit-b": 1, "unit-a": 2 });
    expect(next.sessions[1]!.scope).toBe("unit-a");
  });
});
