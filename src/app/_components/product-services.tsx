"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initialReviewState } from "@/lib/demo/synthetic-fixtures.application";
import { ProductProfileContext } from "./product-profile";
import { AcademicSetupDraftProvider } from "./academic-setup-draft";
import { createSyntheticCollectionMemory } from "@/lib/demo/synthetic-campaigns.application";
import type { ProductState } from "@/lib/demo/synthetic-product-state.application";
import {
  syntheticDisplayNames,
  type SyntheticRole,
} from "@/lib/demo/synthetic-account.application";

export type DemoRole = SyntheticRole;
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
/** The synthetic store, or null on a real route (shared study screens). */
export function useOptionalProductServices() {
  return useContext(ProductContext);
}
export function useProductServices() {
  const services = useContext(ProductContext);
  if (!services)
    throw new Error("An isolated frontend service adapter is required.");
  return services;
}
