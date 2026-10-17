"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { WorkspaceChatSession } from "@/lib/workspace/workspace.application";

/**
 * Authorized data a real study route hands to the shared study screens. The
 * synthetic runtime never provides it, so `useLiveStudy()` is null there and
 * the screens read the document-local synthetic store instead. Real mode has
 * no answering, Studio, quiz, evidence or report backend yet: those tools
 * render their normal layout disabled and never show fixture data.
 */
export type LiveStudy = Readonly<{
  chat?: Readonly<{
    sessions: readonly WorkspaceChatSession[];
    selectedSessionId: string | null;
    startAction: (formData: FormData) => void | Promise<void>;
  }>;
}>;

const LiveStudyContext = createContext<LiveStudy | null>(null);

export function LiveStudyProvider({
  value,
  children,
}: {
  value: LiveStudy;
  children: ReactNode;
}) {
  return (
    <LiveStudyContext.Provider value={value}>
      {children}
    </LiveStudyContext.Provider>
  );
}

export function useLiveStudy() {
  return useContext(LiveStudyContext);
}
