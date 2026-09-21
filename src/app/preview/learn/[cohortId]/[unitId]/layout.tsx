import { notFound } from "next/navigation";
import { Suspense } from "react";

import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import type { WorkspaceLayoutProps } from "@/lib/workspace/workspace-route.types";

export default async function PreviewWorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { cohortId, unitId } = await params;
  const scope = loadSyntheticWorkspaceScope(cohortId, unitId);
  if (scope === null) notFound();
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceFrame scope={scope} preview>
        {children}
      </WorkspaceFrame>
    </Suspense>
  );
}
