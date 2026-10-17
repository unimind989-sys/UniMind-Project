"use client";
import { useEffect, useState } from "react";
import { useOptionalProductServices } from "@/app/_components/product-services";
import { expireQuizAttempt } from "@/lib/quiz/quiz-fixture.application";

/**
 * The study clock: ticks while the unit's timed attempt runs and expires that
 * attempt once its deadline passes. Starting a quiz resets it through `setNow`.
 * Real routes have no quiz attempts yet, so the clock stays still there.
 */
export function useQuizClock(unitId: string) {
  const services = useOptionalProductServices();
  const update = services?.update;
  const [now, setNow] = useState(() => Date.now());
  const attempt = services?.state.attempts[unitId];
  useEffect(() => {
    if (!update) return;
    if (!attempt?.expiresAt || attempt.submitted || attempt.abandoned) return;
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= attempt.expiresAt!)
        update((current) => {
          const latest = current.attempts[unitId];
          if (!latest || latest.inspectionKey !== attempt.inspectionKey)
            return current;
          const expired = expireQuizAttempt(latest, currentTime);
          return expired === latest
            ? current
            : {
                ...current,
                attempts: { ...current.attempts, [unitId]: expired },
              };
        });
    }, 500);
    return () => clearInterval(timer);
  }, [attempt, unitId, update]);
  return [now, setNow] as const;
}
