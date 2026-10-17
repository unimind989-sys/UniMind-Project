"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useProductRouter } from "@/app/_components/product-navigation";
import { useOptionalProductServices } from "@/app/_components/product-services";
import { quizAttemptReviewable } from "@/lib/quiz/quiz-fixture.application";
import {
  buildStudyReturnPath,
  quizInspectionKeyMatches,
} from "@/lib/study/study-origin.application";
import type { ProductStudyProps } from "./study-props";

/**
 * Moves a finished attempt to its canonical review address and remembers the
 * current study view as the learner's return path. Real routes derive their
 * resume path on the server, so this only runs with the synthetic store.
 */
export function useStudyReturnPath(
  { base, screen, scope, locale }: ProductStudyProps,
  now: number,
) {
  const services = useOptionalProductServices();
  const update = services?.update;
  const query = useSearchParams();
  const router = useProductRouter();
  const attempt = services?.state.attempts[scope.unitId];
  const canonicalReview =
    screen === "attempt" &&
    attempt &&
    quizAttemptReviewable(attempt, now) &&
    (!query.has("attempt") ||
      quizInspectionKeyMatches(query, attempt.inspectionKey));
  const reviewPath = canonicalReview
    ? `${base}/quiz/sample-attempt/review?attempt=${encodeURIComponent(attempt.inspectionKey)}&lang=${locale}`
    : null;
  useEffect(() => {
    if (reviewPath) router.replace(reviewPath as Route);
  }, [reviewPath, router]);
  const returnPath = services
    ? buildStudyReturnPath(
        base,
        canonicalReview ? "quiz-review" : screen,
        query,
        attempt,
        now,
      )
    : null;
  useEffect(() => {
    if (returnPath && update) {
      update((current) =>
        current.lastStudyPath === returnPath
          ? current
          : { ...current, lastStudyPath: returnPath },
      );
    }
  }, [returnPath, update]);
}
