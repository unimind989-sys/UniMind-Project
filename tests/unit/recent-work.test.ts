import { describe, expect, it } from "vitest";
import {
  conversationTitle,
  recentStudyDetails,
} from "../../src/lib/study/recent-work.application";

describe("recorded recent-study metadata", () => {
  it("names the first classified question without changing it when later answers arrive", () => {
    expect(
      conversationTitle(
        { answers: [{ kind: "supported" }, { kind: "conflict" }] },
        "en",
      ),
    ).toBe("Study sequence");
    expect(
      conversationTitle(
        { answers: [{ kind: "unavailable", promptKind: "partial" }] },
        "ar",
      ),
    ).toBe("الترتيب والمدة غير المذكورة");
  });
  it("preserves prepared titles and uses neutral empty or unknown fallbacks", () => {
    expect(
      conversationTitle(
        { title: ["Prepared topic", "موضوع معدّ"], answers: [] },
        "ar",
      ),
    ).toBe("موضوع معدّ");
    expect(conversationTitle({ answers: [] }, "en")).toBe("New conversation");
    expect(conversationTitle({ answers: [{ kind: "prototype" }] }, "en")).toBe(
      "New conversation",
    );
    expect(
      conversationTitle({ answers: [{ kind: "constructor" }] }, "en"),
    ).toBe("New conversation");
    expect(
      conversationTitle(
        { answers: [{ kind: "unavailable", promptKind: "unmatched" }] },
        "en",
      ),
    ).toBe("Other question");
  });
  it("does not imply a record for a tool with no recorded result", () => {
    expect(
      recentStudyDetails({ tool: "studio", locale: "en", now: 0 }),
    ).toBeNull();
    expect(
      recentStudyDetails({
        tool: "quiz",
        locale: "en",
        now: 0,
        attempt: { answers: [0], submitted: true },
      }),
    ).toBeNull();
  });
  it("names the actual completed format and topic and rejects unknown metadata", () => {
    expect(
      recentStudyDetails({
        tool: "studio",
        locale: "ar",
        now: 0,
        artifact: { type: "flashcards", topic: "comparison" },
      }),
    ).toEqual({ title: "بطاقات مراجعة", detail: "مقارنة الرسوم" });
    expect(
      recentStudyDetails({
        tool: "studio",
        locale: "en",
        now: 0,
        artifact: { type: "constructor", topic: "comparison" },
      }),
    ).toBeNull();
    expect(
      recentStudyDetails({
        tool: "studio",
        locale: "en",
        now: 0,
        artifact: { type: "summary", topic: "invented" },
      }),
    ).toBeNull();
  });
  it("counts only recorded replies", () => {
    expect(
      recentStudyDetails({
        tool: "chat",
        locale: "en",
        now: 0,
        conversation: { answers: [{ kind: "supported" }] },
      }),
    ).toEqual({ title: "Study sequence", detail: "Replies · 1" });
  });
  it("shows submitted status before expiry and never infers a score", () => {
    expect(
      recentStudyDetails({
        tool: "quiz-review",
        locale: "en",
        now: 100,
        attempt: { answers: [0, -1], submitted: true, expiresAt: 50 },
      }),
    ).toEqual({
      title: "Quiz attempt",
      detail: "Submitted · Review available",
    });
  });
  it("recognizes expiry at the absolute boundary and counts answered questions", () => {
    const attempt = { answers: [0, -1, 1], submitted: false, expiresAt: 100 };
    expect(
      recentStudyDetails({ tool: "attempt", locale: "en", now: 99, attempt })
        ?.detail,
    ).toBe("In progress · 2 answered");
    expect(
      recentStudyDetails({ tool: "attempt", locale: "en", now: 100, attempt })
        ?.detail,
    ).toBe("Expired · Unscored review");
    expect(
      recentStudyDetails({
        tool: "quiz-review",
        locale: "ar",
        now: 0,
        attempt: { ...attempt, abandoned: true },
      })?.detail,
    ).toBe("انتهت المدة · مراجعة دون نتيجة");
  });
});
