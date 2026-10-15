"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { CatalogSelection } from "@/lib/catalog/catalog-journey.application";

type AcademicSetupDraft = {
  selection: CatalogSelection;
  step: number;
};
type DraftService = {
  draft: AcademicSetupDraft | null;
  remember: (draft: AcademicSetupDraft | null) => void;
};
const AcademicDraftContext = createContext<DraftService | null>(null);

function DraftScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const workspace =
    pathname === "/settings" ||
    pathname === "/learn" ||
    pathname.startsWith("/learn/");
  const scope = workspace ? "workspace" : pathname;
  const [state, setState] = useState<{
    scope: string;
    draft: AcademicSetupDraft | null;
  }>({ scope, draft: null });
  if (state.scope !== scope) setState({ scope, draft: null });
  return (
    <AcademicDraftContext.Provider
      value={{
        draft: state.scope === scope ? state.draft : null,
        remember: (draft) => setState({ scope, draft }),
      }}
    >
      {children}
    </AcademicDraftContext.Provider>
  );
}

// UI memory only. Access routes and new documents discard it; catalog
// resolution and explicit academic save remain the authoritative boundaries.
export function AcademicSetupDraftProvider({
  children,
}: {
  children: ReactNode;
}) {
  const inherited = useContext(AcademicDraftContext);
  if (inherited) return children;
  return <DraftScope>{children}</DraftScope>;
}

export function useAcademicSetupDraft() {
  return useContext(AcademicDraftContext);
}
