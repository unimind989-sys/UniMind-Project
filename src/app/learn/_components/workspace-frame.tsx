"use client";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogUnitNode } from "@/lib/catalog/catalog-journey.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { StudyFrame } from "./study-frame";
import { LiveStudyProvider } from "./study/live-study";

/**
 * Real-route adapter for the shared study frame. The authorized scope and
 * catalog units come from the server layout; marking the subtree live keeps
 * the shared study screens off the synthetic store.
 */
export function WorkspaceFrame({
  scope,
  children,
  units = [],
  profileName,
}: {
  scope: WorkspaceScope;
  children: ReactNode;
  units?: readonly CatalogUnitNode[];
  profileName?: string | null | undefined;
}) {
  const locale = useSearchParams().get("lang") === "ar" ? "ar" : "en";
  return (
    <LiveStudyProvider value={{}}>
      <StudyFrame
        scope={scope}
        locale={locale}
        units={units}
        synthetic={false}
        profileName={profileName}
      >
        {children}
      </StudyFrame>
    </LiveStudyProvider>
  );
}
