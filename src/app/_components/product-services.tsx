"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initialReviewState, type ReviewState } from "./synthetic-fixtures";
import { ProductProfileContext } from "./product-profile";
import { AcademicSetupDraftProvider } from "./academic-setup-draft";
import { createSyntheticCollectionMemory } from "./synthetic-campaigns";
import type { AcademicContext } from "@/lib/account/account.application";
import type { QuizConfiguration } from "@/lib/quiz/quiz-fixture.application";
import type { AdminPreviewContext } from "./synthetic-admin-context";
import {
  syntheticDisplayNames,
  type SyntheticRole,
} from "@/lib/demo/synthetic-account.application";

export type DemoRole = SyntheticRole;
export type ProductState = Omit<ReviewState, "attempts"> & {
  attempts: Record<
    string,
    {
      inspectionKey: string;
      answers: number[];
      submitted: boolean;
      configuration: QuizConfiguration;
      expiresAt?: number;
      abandoned?: boolean;
    }
  >;
  role: DemoRole | null;
  displayName: string | null;
  studyLanguage: "en" | "ar" | "mixed" | null;
  evidenceHintSeen: boolean;
  verified: boolean;
  recoveryToken: boolean;
  verificationUsed: boolean;
  invitationUsed: boolean;
  qualityConflictSessionId: number | null;
  returnPath: string | null;
  pendingActors: Record<string, "AHMED" | "ZIAD">;
  pendingReasons: Record<string, string>;
  pendingHoldExpiries: Record<string, string>;
  pendingVersions: Record<string, number>;
  adminPreview: AdminPreviewContext | null;
  catalogChoice: "MODULE" | "SUBJECT";
  chatDrafts: Record<
    string,
    { message: string; language: "en" | "ar" | "mixed" }
  >;
  lastStudyPath: string | null;
  studioDrafts: ProductState["artifacts"];
  quizDrafts: Record<string, QuizConfiguration>;
  academicContext: AcademicContext | null;
};
export function initialProductState(): ProductState {
  return {
    ...initialReviewState(),
    attempts: {},
    role: null,
    displayName: null,
    studyLanguage: null,
    evidenceHintSeen: false,
    verified: true,
    recoveryToken: false,
    verificationUsed: false,
    invitationUsed: false,
    qualityConflictSessionId: null,
    returnPath: null,
    pendingActors: {},
    pendingReasons: {},
    pendingHoldExpiries: {},
    pendingVersions: {},
    adminPreview: null,
    catalogChoice: "MODULE",
    chatDrafts: {},
    lastStudyPath: null,
    studioDrafts: {},
    quizDrafts: {},
    academicContext: null,
  };
}
type Services = {
  collectionMemory: ReturnType<typeof createSyntheticCollectionMemory>;
  state: ProductState;
  update: (change: (state: ProductState) => ProductState) => void;
  reset: () => void;
};
const ProductContext = createContext<Services | null>(null);

// A fresh document owns a fresh adapter instance. No Auth/session cookie,
// storage, server singleton, real action, upload or provider is involved.
export function SyntheticProductProvider({
  children,
  entry,
}: {
  children: ReactNode;
  entry?: { role: DemoRole; returnPath: string };
}) {
  const [collectionMemory] = useState(createSyntheticCollectionMemory);
  const [state, update] = useState(() => ({
    ...initialProductState(),
    ...(entry
      ? {
          role: entry.role,
          displayName: syntheticDisplayNames[entry.role],
          account: "SIGNED_IN" as const,
          returnPath: entry.returnPath,
        }
      : {}),
  }));
  return (
    <AcademicSetupDraftProvider>
      <ProductContext.Provider
        value={{
          state,
          update,
          collectionMemory,
          reset: () => {
            collectionMemory.clear();
            update(initialProductState());
          },
        }}
      >
        <ProductProfileContext.Provider
          value={
            state.displayName ??
            (state.role ? syntheticDisplayNames[state.role] : null)
          }
        >
          {children}
        </ProductProfileContext.Provider>
      </ProductContext.Provider>
    </AcademicSetupDraftProvider>
  );
}
export function useProductServices() {
  const services = useContext(ProductContext);
  if (!services)
    throw new Error("An isolated frontend service adapter is required.");
  return services;
}
