"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initialReviewState, type ReviewState } from "./synthetic-fixtures";
import type { AcademicContext } from "@/lib/account/account.application";
import type { SyntheticRole } from "@/lib/demo/synthetic-account.application";

export type DemoRole = SyntheticRole;
export type ProductState = Omit<ReviewState, "attempts"> & {
  attempts: Record<
    string,
    {
      answers: number[];
      submitted: boolean;
      expiresAt?: number;
      abandoned?: boolean;
    }
  >;
  role: DemoRole | null;
  verified: boolean;
  recoveryToken: boolean;
  verificationUsed: boolean;
  invitationUsed: boolean;
  returnPath: string | null;
  pendingActors: Record<string, "AHMED" | "ZIAD">;
  pendingReasons: Record<string, string>;
  chatDrafts: Record<
    string,
    { message: string; language: "en" | "ar" | "mixed" }
  >;
  lastStudyPath: string | null;
  studioDrafts: ProductState["artifacts"];
  academicContext: AcademicContext | null;
};
export function initialProductState(): ProductState {
  return {
    ...initialReviewState(),
    role: null,
    verified: true,
    recoveryToken: false,
    verificationUsed: false,
    invitationUsed: false,
    returnPath: null,
    pendingActors: {},
    pendingReasons: {},
    chatDrafts: {},
    lastStudyPath: null,
    studioDrafts: {},
    academicContext: null,
  };
}
type Services = {
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
  const [state, update] = useState(() => ({
    ...initialProductState(),
    ...(entry
      ? {
          role: entry.role,
          account: "SIGNED_IN" as const,
          returnPath: entry.returnPath,
        }
      : {}),
  }));
  return (
    <ProductContext.Provider
      value={{ state, update, reset: () => update(initialProductState()) }}
    >
      {children}
    </ProductContext.Provider>
  );
}
export function useProductServices() {
  const services = useContext(ProductContext);
  if (!services)
    throw new Error("An isolated frontend service adapter is required.");
  return services;
}
