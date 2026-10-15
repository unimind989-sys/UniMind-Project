import { quizAttemptReviewable } from "../quiz/quiz-fixture.application";

export type ChatExchangeSelection = {
  origin: "chat";
  sessionId: number;
  exchange: number;
};

// A URL selects a fixture object, never identity, permission or backend access.
// Existing Chat links omit from; other tools cannot select a Chat report.
export function resolveChatExchangeSelection(
  query: Pick<URLSearchParams, "getAll">,
): ChatExchangeSelection | null {
  const origins = query.getAll("from");
  if (origins.length > 1 || (origins.length === 1 && origins[0] !== "chat"))
    return null;
  const positiveId = (key: string): number | null => {
    const values = query.getAll(key);
    if (values.length !== 1 || !/^[1-9]\d*$/u.test(values[0]!)) return null;
    const value = Number(values[0]);
    return Number.isSafeInteger(value) ? value : null;
  };
  const sessionId = positiveId("session");
  const exchange = positiveId("exchange");
  return sessionId !== null && exchange !== null
    ? { origin: "chat", sessionId, exchange }
    : null;
}

type InspectedQuiz = {
  inspectionKey: string;
  submitted: boolean;
  abandoned?: boolean;
  expiresAt?: number;
};
export type QuizSourceSelection =
  | { kind: "attempt" | "review"; inspectionKey: string }
  | { kind: "unavailable" };

export function quizInspectionKeyMatches(
  query: Pick<URLSearchParams, "getAll">,
  inspectionKey: string | undefined,
): boolean {
  const keys = query.getAll("attempt");
  return (
    Boolean(inspectionKey) && keys.length === 1 && keys[0] === inspectionKey
  );
}

// Source returns use only closed stages and the current unit's document object.
// Unknown/ambiguous origins cannot become a guessed Chat or replacement quiz.
export function resolveQuizSourceSelection(
  query: Pick<URLSearchParams, "getAll">,
  attempt: InspectedQuiz | undefined,
  now?: number,
): QuizSourceSelection | null {
  const origins = query.getAll("from");
  if (
    !query.getAll("attempt").length &&
    (!origins.length ||
      (origins.length === 1 && ["chat", "studio"].includes(origins[0]!)))
  )
    return null;
  if (
    origins.length !== 1 ||
    !["quiz-attempt", "quiz-review"].includes(origins[0]!) ||
    !quizInspectionKeyMatches(query, attempt?.inspectionKey) ||
    (origins[0] === "quiz-review" &&
      (!attempt || !quizAttemptReviewable(attempt, now)))
  )
    return { kind: "unavailable" };
  return {
    kind: origins[0] === "quiz-review" ? "review" : "attempt",
    inspectionKey: attempt!.inspectionKey,
  };
}

export type StudyReturnTool =
  "chat" | "studio" | "quiz" | "attempt" | "quiz-review";
const studyReturnSuffixes: Record<StudyReturnTool, string> = {
  chat: "/chat",
  studio: "/studio",
  quiz: "/quiz",
  attempt: "/quiz/sample-attempt",
  "quiz-review": "/quiz/sample-attempt/review",
};
const studyBase = /^\/learn\/[a-z0-9-]+\/[a-z0-9-]+$/u;

// Record a supported view, not arbitrary URLs or evidence/report detours.
export function buildStudyReturnPath(
  base: string,
  screen: string,
  query: Pick<URLSearchParams, "getAll">,
  attempt: InspectedQuiz | undefined,
  now?: number,
): string | null {
  if (!studyBase.test(base) || !Object.hasOwn(studyReturnSuffixes, screen))
    return null;
  const tool = screen as StudyReturnTool;
  const path = base + studyReturnSuffixes[tool];
  if (tool !== "attempt" && tool !== "quiz-review") return path;
  if (
    !attempt?.inspectionKey ||
    (query.getAll("attempt").length > 0 &&
      !quizInspectionKeyMatches(query, attempt.inspectionKey)) ||
    (tool === "quiz-review" && !quizAttemptReviewable(attempt, now))
  )
    return null;
  return `${path}?attempt=${encodeURIComponent(attempt.inspectionKey)}`;
}

// The UI supplies one available catalog scope; this selector grants no access.
export function resolveStudyReturnPath(
  path: string | null,
  base: string,
  attempt: InspectedQuiz | undefined,
  now?: number,
): { href: string; tool: StudyReturnTool } | null {
  if (!path || !studyBase.test(base) || !path.startsWith(base + "/"))
    return null;
  const address = new URL(path, "https://unimind.invalid");
  if (address.origin !== "https://unimind.invalid" || address.hash) return null;
  const tool = (Object.keys(studyReturnSuffixes) as StudyReturnTool[]).find(
    (candidate) => address.pathname === base + studyReturnSuffixes[candidate],
  );
  if (!tool) return null;
  const expected = buildStudyReturnPath(
    base,
    tool,
    address.searchParams,
    attempt,
    now,
  );
  return expected === path ? { href: expected, tool } : null;
}
