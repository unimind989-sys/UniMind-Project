"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ReviewState } from "../review-fixtures";
import { initialReviewState } from "../review-fixtures";

type ReviewContextValue = {
  state: ReviewState;
  update: (change: (state: ReviewState) => ReviewState) => void;
  reset: () => void;
  revision: number;
};
const ReviewContext = createContext<ReviewContextValue | null>(null);

// Each document has its own provider. No storage, cookies, global server map,
// Auth SDK, server action or API is involved in a simulated interaction.
export function ReviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReviewState>(initialReviewState);
  const [revision, setRevision] = useState(0);
  return (
    <ReviewContext.Provider
      value={{
        state,
        update: setState,
        revision,
        reset: () => {
          setState(initialReviewState());
          setRevision((value) => value + 1);
        },
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (context === null)
    throw new Error("Synthetic review provider is required.");
  return context;
}
