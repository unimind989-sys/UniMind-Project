"use client";
import type { Route } from "next";
import { useProductRouter } from "@/app/_components/product-navigation";
import { useOptionalProductServices } from "@/app/_components/product-services";
import {
  defaultScope,
  type Locale,
} from "@/lib/demo/synthetic-fixtures.application";
import {
  answerQuizAttempt,
  defaultQuizConfiguration,
  fixtureQuizAttempt,
  fixtureQuizQuestions,
  quizConfigurationErrors,
  submitQuizAttempt,
  validQuizConfiguration,
  type QuizConfiguration,
} from "@/lib/quiz/quiz-fixture.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { useLiveStudy } from "./live-study";

export type QuizSession = ReturnType<typeof useQuizSession>;

/**
 * The unit's quiz in tab memory: the setup draft, the latest attempt and its
 * questions, and the actions that start, answer and submit it. Real routes
 * have no quiz backend yet: the setup is `unavailable` and every action is
 * inert.
 */
export function useQuizSession(
  scope: WorkspaceScope,
  locale: Locale,
  base: string,
  onQuizStart: (time: number) => void,
) {
  const live = useLiveStudy();
  const services = useOptionalProductServices();
  const unavailable = live !== null || !services;
  const state = services?.state;
  const update =
    services?.update ??
    (() => {
      /* No quiz state on a real route. */
    });
  const router = useProductRouter();
  const attempt = state?.attempts[scope.unitId];
  const configuration =
    state?.quizDrafts[scope.unitId] ?? defaultQuizConfiguration;
  const configurationErrors = quizConfigurationErrors(configuration);
  function setConfiguration(
    change: (value: QuizConfiguration) => QuizConfiguration,
  ) {
    update((current) => ({
      ...current,
      quizDrafts: {
        ...current.quizDrafts,
        [scope.unitId]: change(
          current.quizDrafts[scope.unitId] ?? defaultQuizConfiguration,
        ),
      },
    }));
  }
  const handoutAvailable =
    !unavailable &&
    (scope.unitId !== defaultScope.unitId ||
      state?.availability.sourceActive === true);
  const questions = fixtureQuizQuestions(
    attempt?.configuration ?? defaultQuizConfiguration,
    locale,
  );
  function start(config = configuration, expectedKey?: string) {
    if (!handoutAvailable || !validQuizConfiguration(config)) return;
    const startedAt = Date.now();
    onQuizStart(startedAt);
    const prepared = {
      ...fixtureQuizAttempt(config, startedAt),
      inspectionKey: crypto.randomUUID(),
    };
    update((current) =>
      expectedKey &&
      current.attempts[scope.unitId]?.inspectionKey !== expectedKey
        ? current
        : {
            ...current,
            quizDrafts: {
              ...current.quizDrafts,
              [scope.unitId]: { ...config },
            },
            attempts: {
              ...current.attempts,
              [scope.unitId]: prepared,
            },
          },
    );
    router.push(
      `${base}/quiz/sample-attempt?attempt=${encodeURIComponent(prepared.inspectionKey)}&lang=${locale}` as Route,
    );
  }
  /** Records one choice on the attempt identified by `inspectionKey` only. */
  function answer(inspectionKey: string, index: number, answerIndex: number) {
    const answeredAt = Date.now();
    update((current) => {
      const latest = current.attempts[scope.unitId];
      if (!latest || latest.inspectionKey !== inspectionKey) return current;
      const next = answerQuizAttempt(latest, index, answerIndex, answeredAt);
      return next === latest
        ? current
        : {
            ...current,
            attempts: {
              ...current.attempts,
              [scope.unitId]: next,
            },
          };
    });
  }
  function submit(inspectionKey: string) {
    const submittedAt = Date.now();
    update((current) => {
      const latest = current.attempts[scope.unitId];
      if (!latest || latest.inspectionKey !== inspectionKey) return current;
      const next = submitQuizAttempt(latest, submittedAt);
      return next === latest
        ? current
        : {
            ...current,
            attempts: { ...current.attempts, [scope.unitId]: next },
          };
    });
  }
  return {
    unavailable,
    attempt,
    configuration,
    configurationErrors,
    setConfiguration,
    handoutAvailable,
    questions,
    start,
    answer,
    submit,
  };
}
