import { describe, expect, it } from "vitest";
import {
  defaultQuizConfiguration,
  fixtureQuizAttempt,
  fixtureQuizQuestions,
  quizAttemptExpired,
  expireQuizAttempt,
  answerQuizAttempt,
  submitQuizAttempt,
  quizAttemptReviewable,
  validQuizConfiguration,
  quizConfigurationErrors,
  parseQuizNumber,
} from "../../src/lib/quiz/quiz-fixture.application";

describe("document-local sample quiz configuration", () => {
  it.each([
    [
      "easy",
      [
        ["handout"],
        ["recording"],
        ["handout", "recording"],
        ["handout"],
        ["recording"],
        ["handout", "recording"],
      ],
    ],
    [
      "medium",
      [
        ["handout"],
        ["handout", "recording"],
        ["recording"],
        ["handout", "recording"],
        ["recording"],
        ["handout"],
      ],
    ],
    [
      "hard",
      [
        ["handout", "recording"],
        ["handout", "recording"],
        ["handout", "recording"],
        ["handout", "recording"],
        ["handout", "recording"],
        ["handout"],
      ],
    ],
  ] as const)(
    "binds every %s explanation to the actual fixed evidence in both languages",
    (difficulty, expected) => {
      for (const locale of ["en", "ar"] as const) {
        const questions = fixtureQuizQuestions(
          { ...defaultQuizConfiguration, questionCount: 6, difficulty },
          locale,
        );
        expect(
          questions.map((question) => question.supportingPassages),
        ).toEqual(expected);
        expect(
          questions.every((question) => question.supportingPassages.length > 0),
        ).toBe(true);
      }
    },
  );
  it.each([0, 7, 2.5, Number.NaN])(
    "identifies only the untimed count error for %s",
    (questionCount) => {
      const config = {
        ...defaultQuizConfiguration,
        questionCount,
        durationMinutes: Number.NaN,
      };
      expect(quizConfigurationErrors(config)).toEqual({
        questionCount: true,
        durationMinutes: false,
      });
      expect(validQuizConfiguration(config)).toBe(false);
    },
  );
  it.each([0, 241, 2.5, Number.NaN])(
    "identifies only the active duration error for %s",
    (durationMinutes) => {
      const config = {
        ...defaultQuizConfiguration,
        mode: "timed" as const,
        durationMinutes,
      };
      expect(quizConfigurationErrors(config)).toEqual({
        questionCount: false,
        durationMinutes: true,
      });
      expect(validQuizConfiguration(config)).toBe(false);
      expect(validQuizConfiguration({ ...config, mode: "untimed" })).toBe(true);
    },
  );
  it("keeps both field errors specific when both timed fields are invalid", () => {
    expect(
      quizConfigurationErrors({
        ...defaultQuizConfiguration,
        mode: "timed",
        questionCount: 7,
        durationMinutes: 241,
      }),
    ).toEqual({ questionCount: true, durationMinutes: true });
  });
  it.each([1, 4, 6])(
    "creates exactly %i unanswered questions",
    (questionCount) => {
      const config = { ...defaultQuizConfiguration, questionCount };
      expect(fixtureQuizAttempt(config, 100).answers).toEqual(
        Array(questionCount).fill(-1),
      );
      expect(fixtureQuizQuestions(config, "en")).toHaveLength(questionCount);
    },
  );
  it("changes question content for difficulty and preserves scoring across locale", () => {
    const easy = fixtureQuizQuestions(
      { ...defaultQuizConfiguration, difficulty: "easy" },
      "en",
    );
    const hard = fixtureQuizQuestions(
      { ...defaultQuizConfiguration, difficulty: "hard" },
      "en",
    );
    expect(hard[0]?.prompt).not.toBe(easy[0]?.prompt);
    expect(hard.map((q) => q.correct)).toEqual(
      fixtureQuizQuestions(
        { ...defaultQuizConfiguration, difficulty: "hard" },
        "ar",
      ).map((q) => q.correct),
    );
  });
  it("uses the chosen deadline and rejects submission at its boundary", () => {
    const attempt = fixtureQuizAttempt(
      { ...defaultQuizConfiguration, mode: "timed", durationMinutes: 3 },
      100,
    );
    expect(attempt.expiresAt).toBe(180100);
    expect(quizAttemptExpired(attempt, 180099)).toBe(false);
    expect(quizAttemptExpired(attempt, 180100)).toBe(true);
    expect(
      fixtureQuizAttempt(defaultQuizConfiguration, 100).expiresAt,
    ).toBeUndefined();
  });
  it.each([0, 7, 1.5, Number.NaN])(
    "rejects unsupported question count %s",
    (questionCount) => {
      expect(
        validQuizConfiguration({ ...defaultQuizConfiguration, questionCount }),
      ).toBe(false);
      expect(() =>
        fixtureQuizAttempt({ ...defaultQuizConfiguration, questionCount }, 0),
      ).toThrow();
    },
  );
  it.each([0, 241, 1.5, Number.NaN])(
    "rejects invalid timed duration %s",
    (durationMinutes) => {
      expect(
        validQuizConfiguration({
          ...defaultQuizConfiguration,
          mode: "timed",
          durationMinutes,
        }),
      ).toBe(false);
    },
  );
  it("captures configuration independently from later setup edits", () => {
    const config = { ...defaultQuizConfiguration };
    const attempt = fixtureQuizAttempt(config, 0);
    config.questionCount = 6;
    expect(attempt.configuration.questionCount).toBe(2);
  });
});

describe("frozen synthetic quiz outcomes", () => {
  const prepare = () => ({
    ...fixtureQuizAttempt(
      { ...defaultQuizConfiguration, mode: "timed", durationMinutes: 1 },
      0,
    ),
    inspectionKey: "original",
  });
  it("keeps partial selections and configuration at expiry without scoring", () => {
    const original = answerQuizAttempt(prepare(), 0, 1, 59_999);
    const expired = expireQuizAttempt(original, 60_000);
    expect(expired.answers).toEqual([1, -1]);
    expect(expired.submitted).toBe(false);
    expect(expired).toMatchObject({ abandoned: true });
    expect(expired.inspectionKey).toBe("original");
    expect(expired.configuration).toEqual(original.configuration);
    expect(original).not.toHaveProperty("abandoned");
    expect(quizAttemptReviewable(expired)).toBe(true);
    expect(answerQuizAttempt(expired, 1, 0, 60_001)).toBe(expired);
    expect(submitQuizAttempt(expired, 60_001)).toBe(expired);
  });
  it("rejects an answer at the deadline before a delayed timer has run", () => {
    const original = prepare();
    const expired = answerQuizAttempt(original, 0, 0, 60_000);
    expect(expired.answers).toEqual([-1, -1]);
    expect(expired).toMatchObject({ abandoned: true });
    expect(expired.submitted).toBe(false);
  });
  it("expires a fully answered late submission without producing a score", () => {
    const answered = answerQuizAttempt(
      answerQuizAttempt(prepare(), 0, 0, 59_998),
      1,
      1,
      59_999,
    );
    const expired = submitQuizAttempt(answered, 60_000);
    expect(expired.answers).toEqual([0, 1]);
    expect(expired.submitted).toBe(false);
    expect(expired).toMatchObject({ abandoned: true });
  });
  it("keeps submitted scores immutable even after the old deadline", () => {
    const answered = answerQuizAttempt(
      answerQuizAttempt(prepare(), 0, 0, 10),
      1,
      1,
      20,
    );
    const submitted = submitQuizAttempt(answered, 59_999);
    expect(submitted.submitted).toBe(true);
    expect(quizAttemptReviewable(submitted)).toBe(true);
    expect(expireQuizAttempt(submitted, 60_000)).toBe(submitted);
    expect(answerQuizAttempt(submitted, 0, 1, 60_001)).toBe(submitted);
    expect(submitQuizAttempt(submitted, 60_001)).toBe(submitted);
  });
  it("keeps incomplete untimed work active and rejects invalid answer positions", () => {
    const original = fixtureQuizAttempt(defaultQuizConfiguration, 0);
    expect(submitQuizAttempt(original, 1_000_000)).toBe(original);
    expect(expireQuizAttempt(original, 1_000_000)).toBe(original);
    expect(quizAttemptReviewable(original)).toBe(false);
    for (const [index, answer] of [
      [-1, 0],
      [2, 0],
      [0.5, 0],
      [0, 2],
      [0, -1],
    ])
      expect(answerQuizAttempt(original, index!, answer!, 100)).toBe(original);
  });
});

// WP03-T29 IX-13: quiz numbers typed on an Arabic keyboard.
describe("typed quiz numbers", () => {
  const arabicIndic = (digits: string) =>
    Array.from(digits, (digit) =>
      String.fromCharCode(0x0660 + Number(digit)),
    ).join("");
  const extendedArabicIndic = (digits: string) =>
    Array.from(digits, (digit) =>
      String.fromCharCode(0x06f0 + Number(digit)),
    ).join("");

  it.each([
    ["3", 3],
    [" 12 ", 12],
    ["06", 6],
    [arabicIndic("3"), 3],
    [arabicIndic("240"), 240],
    [extendedArabicIndic("45"), 45],
    [`${arabicIndic("1")}5`, 15],
    ["2.5", 2.5],
    [
      `${arabicIndic("2")}${String.fromCharCode(0x066b)}${arabicIndic("5")}`,
      2.5,
    ],
  ])("reads %j as %d", (text, expected) => {
    expect(parseQuizNumber(text)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "-1",
    "1e2",
    "3 4",
    "three",
    `${arabicIndic("3")}a`,
    "+3",
    "0x10",
  ])("reads %j as not a number", (text) => {
    expect(parseQuizNumber(text)).toBeNaN();
  });

  it("feeds the same whole-number rules as typed Latin digits", () => {
    const timed = { ...defaultQuizConfiguration, mode: "timed" as const };
    expect(
      validQuizConfiguration({
        ...timed,
        questionCount: parseQuizNumber(arabicIndic("6")),
        durationMinutes: parseQuizNumber(arabicIndic("240")),
      }),
    ).toBe(true);
    expect(
      quizConfigurationErrors({
        ...timed,
        questionCount: parseQuizNumber(arabicIndic("7")),
        durationMinutes: parseQuizNumber(`${arabicIndic("2")}.5`),
      }),
    ).toEqual({ questionCount: true, durationMinutes: true });
  });
});
