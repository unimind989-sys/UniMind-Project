"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initialReviewState, type ReviewState } from "./synthetic-fixtures";

export type DemoRole = "student" | "leader" | "admin" | "second-admin";
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
  chatDrafts: Record<
    string,
    { message: string; language: "en" | "ar" | "mixed" }
  >;
  lastStudyPath: string | null;
  studioDrafts: ProductState["artifacts"];
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
    chatDrafts: {},
    lastStudyPath: null,
    studioDrafts: {},
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
}: {
  children: ReactNode;
}) {
  const [state, update] = useState(initialProductState);
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
