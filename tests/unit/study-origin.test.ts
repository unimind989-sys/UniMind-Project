import { describe, expect, it } from "vitest";
import {
  resolveChatExchangeSelection,
  resolveQuizSourceSelection,
  quizInspectionKeyMatches,
  buildStudyReturnPath,
  resolveStudyReturnPath,
} from "../../src/lib/study/study-origin.application";

describe("explicit Chat exchange selection", () => {
  it.each([
    "session=12&exchange=2",
    "exchange=2&session=12&from=chat",
    "session=12&exchange=2&lang=ar&fixture=ready",
  ])(
    "accepts an exact Chat target independent of locale and unrelated query fields: %s",
    (query) => {
      expect(resolveChatExchangeSelection(new URLSearchParams(query))).toEqual({
        origin: "chat",
        sessionId: 12,
        exchange: 2,
      });
    },
  );
  it.each([
    "",
    "session=1",
    "exchange=1",
    "session=0&exchange=1",
    "session=-1&exchange=1",
    "session=01&exchange=1",
    "session=1.0&exchange=1",
    "session=1e0&exchange=1",
    "session=%201&exchange=1",
    "session=9007199254740992&exchange=1",
    "session=1&exchange=0",
    "session=1&exchange=-1",
    "session=1&exchange=01",
    "session=1&exchange=1.0",
    "session=1&exchange=1e0",
    "session=1&exchange=9007199254740992",
    "session=1&session=1&exchange=1",
    "session=1&exchange=1&exchange=2",
    "session=1&exchange=1&from=studio",
    "session=1&exchange=1&from=quiz",
    "session=1&exchange=1&from=unknown",
    "session=1&exchange=1&from=",
    "session=1&exchange=1&from=chat&from=chat",
  ])(
    "rejects missing ambiguous noncanonical or unsupported targets: %s",
    (query) => {
      expect(
        resolveChatExchangeSelection(new URLSearchParams(query)),
      ).toBeNull();
    },
  );
  it("does not mutate the supplied query", () => {
    const query = new URLSearchParams("session=1&exchange=1&lang=ar");
    const before = query.toString();
    resolveChatExchangeSelection(query);
    expect(query.toString()).toBe(before);
  });
});

describe("one exact recent study return", () => {
  const base = "/learn/cohort-a/unit-a";
  const key = "attempt-a";
  const attempt = { inspectionKey: key, submitted: false };
  it.each(["chat", "studio", "quiz"])(
    "captures %s without arbitrary query or locale",
    (tool) => {
      const query = new URLSearchParams(
        "lang=ar&return=https://example.invalid/private#wrong",
      );
      const before = query.toString();
      expect(buildStudyReturnPath(base, tool, query, attempt)).toBe(
        `${base}/${tool}`,
      );
      expect(resolveStudyReturnPath(`${base}/${tool}`, base, attempt)).toEqual({
        href: `${base}/${tool}`,
        tool,
      });
      expect(query.toString()).toBe(before);
    },
  );
  it.each(["", `attempt=${key}&lang=ar`])(
    "captures the current attempt identity: %s",
    (query) => {
      expect(
        buildStudyReturnPath(
          base,
          "attempt",
          new URLSearchParams(query),
          attempt,
        ),
      ).toBe(`${base}/quiz/sample-attempt?attempt=${key}`);
    },
  );
  it("captures review only after submission and keeps its stage", () => {
    const query = new URLSearchParams();
    expect(
      buildStudyReturnPath(base, "quiz-review", query, attempt),
    ).toBeNull();
    const submitted = { ...attempt, submitted: true };
    const href = `${base}/quiz/sample-attempt/review?attempt=${key}`;
    expect(buildStudyReturnPath(base, "quiz-review", query, submitted)).toBe(
      href,
    );
    expect(resolveStudyReturnPath(href, base, submitted)).toEqual({
      href,
      tool: "quiz-review",
    });
    expect(resolveStudyReturnPath(href, base, attempt)).toBeNull();
  });
  it("captures the matching frozen expired review without claiming submission", () => {
    const expired = { ...attempt, abandoned: true };
    const href = `${base}/quiz/sample-attempt/review?attempt=${key}`;
    expect(
      buildStudyReturnPath(base, "quiz-review", new URLSearchParams(), expired),
    ).toBe(href);
    expect(resolveStudyReturnPath(href, base, expired)).toEqual({
      href,
      tool: "quiz-review",
    });
    expect(
      resolveStudyReturnPath(href, base, { ...expired, inspectionKey: "new" }),
    ).toBeNull();
    expect(expired.submitted).toBe(false);
  });
  it.each(["attempt=", "attempt=other", `attempt=${key}&attempt=${key}`])(
    "a rejected attempt view cannot overwrite the recent tool: %s",
    (query) => {
      expect(
        buildStudyReturnPath(
          base,
          "attempt",
          new URLSearchParams(query),
          attempt,
        ),
      ).toBeNull();
    },
  );
  it.each([
    "sources",
    "evidence",
    "report",
    "settings",
    "overview",
    "quiz-unknown",
  ])("does not capture a detour or unsupported screen: %s", (screen) => {
    expect(
      buildStudyReturnPath(base, screen, new URLSearchParams(), attempt),
    ).toBeNull();
  });
  it.each([
    "https://example.invalid/learn/cohort-a/unit-a",
    "/learn/cohort-a",
    "/learn/cohort-a/unit-a/extra",
    "/learn/cohort-a/../unit-a",
  ])("rejects a noncanonical base: %s", (scope) => {
    expect(
      buildStudyReturnPath(scope, "chat", new URLSearchParams(), attempt),
    ).toBeNull();
  });
  it.each([
    null,
    "",
    "https://example.invalid/learn/cohort-a/unit-a/chat",
    "/learn/cohort-b/unit-a/chat",
    "/learn/cohort-a/unit-b/chat",
    `${base}/sources`,
    `${base}/quiz/sample-attempt`,
    `${base}/quiz/sample-attempt?attempt=other`,
    `${base}/quiz/sample-attempt?attempt=${key}&attempt=${key}`,
    `${base}/quiz/sample-attempt?attempt=${key}&lang=ar`,
    `${base}/chat?session=2`,
    `${base}/studio#artifact`,
    `${base}/quiz/../chat`,
  ])("resolves only an exact available-scope closed path: %s", (path) => {
    expect(resolveStudyReturnPath(path, base, attempt)).toBeNull();
  });
  it("absence or replacement cannot borrow an old quiz identity", () => {
    const href = `${base}/quiz/sample-attempt?attempt=${key}`;
    expect(resolveStudyReturnPath(href, base, undefined)).toBeNull();
    expect(
      resolveStudyReturnPath(href, base, {
        ...attempt,
        inspectionKey: "new-attempt",
      }),
    ).toBeNull();
    expect(resolveStudyReturnPath(href, base, attempt)).toEqual({
      href,
      tool: "attempt",
    });
    expect(
      buildStudyReturnPath(base, "attempt", new URLSearchParams(), undefined),
    ).toBeNull();
  });
});

describe("document-local quiz source return", () => {
  const key = "a4a0b443-0fab-4df0-82f5-8b7f19f85bbc";
  const other = "b780f56d-9a4d-41d2-a068-c394ba28e2ea";
  const attempt = { inspectionKey: key, submitted: false };
  it("recognizes an expired deadline before the UI timer writes the terminal flag", () => {
    const timed = { ...attempt, expiresAt: 60_000 };
    const query = new URLSearchParams(`from=quiz-review&attempt=${key}`);
    expect(resolveQuizSourceSelection(query, timed, 59_999)).toEqual({
      kind: "unavailable",
    });
    expect(resolveQuizSourceSelection(query, timed, 60_000)).toEqual({
      kind: "review",
      inspectionKey: key,
    });
    const base = "/learn/cohort-a/unit-a";
    const href = `${base}/quiz/sample-attempt/review?attempt=${key}`;
    expect(
      buildStudyReturnPath(base, "quiz-review", query, timed, 59_999),
    ).toBeNull();
    expect(
      buildStudyReturnPath(base, "quiz-review", query, timed, 60_000),
    ).toBe(href);
    expect(resolveStudyReturnPath(href, base, timed, 60_000)).toEqual({
      href,
      tool: "quiz-review",
    });
    expect(timed).not.toHaveProperty("abandoned");
    expect(timed.submitted).toBe(false);
  });
  it.each([false, true])(
    "attempt origin stays on the same object, submitted=%s",
    (submitted) => {
      expect(
        resolveQuizSourceSelection(
          new URLSearchParams(`from=quiz-attempt&attempt=${key}`),
          { ...attempt, submitted },
        ),
      ).toEqual({ kind: "attempt", inspectionKey: key });
    },
  );
  it("review requires submission of the matching object", () => {
    const query = new URLSearchParams(`from=quiz-review&attempt=${key}`);
    expect(resolveQuizSourceSelection(query, attempt)).toEqual({
      kind: "unavailable",
    });
    expect(
      resolveQuizSourceSelection(query, { ...attempt, submitted: true }),
    ).toEqual({ kind: "review", inspectionKey: key });
  });
  it("allows only the matching expired review without manufacturing a score", () => {
    const expired = { ...attempt, abandoned: true };
    const query = new URLSearchParams(`from=quiz-review&attempt=${key}`);
    expect(resolveQuizSourceSelection(query, expired)).toEqual({
      kind: "review",
      inspectionKey: key,
    });
    expect(
      resolveQuizSourceSelection(query, { ...expired, inspectionKey: other }),
    ).toEqual({ kind: "unavailable" });
    expect(expired.submitted).toBe(false);
  });
  it.each(["", "from=chat", "from=studio"])(
    "preserves unrelated existing source origins: %s",
    (query) => {
      expect(
        resolveQuizSourceSelection(new URLSearchParams(query), attempt),
      ).toBeNull();
    },
  );
  it.each([
    `attempt=${key}`,
    `from=chat&attempt=${key}`,
    `from=studio&attempt=${key}`,
    "from=quiz-attempt",
    "from=quiz-attempt&attempt=",
    "from=quiz-attempt&attempt=unknown",
    "from=quiz-attempt&attempt=../quiz",
    `from=quiz-attempt&attempt=${other}`,
    `from=quiz-attempt&attempt=${key}&attempt=${key}`,
    `from=quiz-attempt&from=quiz-attempt&attempt=${key}`,
    `from=studio&from=quiz-attempt&attempt=${key}`,
    `from=quiz-unknown&attempt=${key}`,
    `from=https://example.invalid&attempt=${key}`,
    `from=QUIZ-ATTEMPT&attempt=${key}`,
  ])(
    "rejects missing ambiguous unsupported or different quiz identity: %s",
    (query) => {
      expect(
        resolveQuizSourceSelection(new URLSearchParams(query), attempt),
      ).toEqual({ kind: "unavailable" });
    },
  );
  it("absence and replacement cannot borrow the old object's identity", () => {
    const query = new URLSearchParams(`from=quiz-attempt&attempt=${key}`);
    expect(resolveQuizSourceSelection(query, undefined)).toEqual({
      kind: "unavailable",
    });
    expect(
      resolveQuizSourceSelection(query, { ...attempt, inspectionKey: other }),
    ).toEqual({ kind: "unavailable" });
  });
  it.each(["", "attempt=", "attempt=unknown", `attempt=${key}&attempt=${key}`])(
    "return destination key also rejects invalid identity: %s",
    (query) => {
      expect(quizInspectionKeyMatches(new URLSearchParams(query), key)).toBe(
        false,
      );
    },
  );
  it("matching return identity is independent of locale and ignores arbitrary return URLs", () => {
    const query = new URLSearchParams(
      `from=quiz-attempt&attempt=${key}&lang=ar&return=https://example.invalid/private`,
    );
    const before = query.toString();
    expect(quizInspectionKeyMatches(query, key)).toBe(true);
    expect(quizInspectionKeyMatches(query, undefined)).toBe(false);
    expect(resolveQuizSourceSelection(query, attempt)).toEqual({
      kind: "attempt",
      inspectionKey: key,
    });
    expect(query.toString()).toBe(before);
  });
});
