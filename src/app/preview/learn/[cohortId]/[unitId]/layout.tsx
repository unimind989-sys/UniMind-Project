import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";

export default async function PreviewWorkspaceLayout({
  children,
  params,
}: LayoutProps<"/preview/learn/[cohortId]/[unitId]">) {
  const { cohortId, unitId } = await params;
  const scope = loadSyntheticWorkspaceScope(cohortId, unitId);
  if (scope === null) notFound();
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceFrame scope={scope} preview>
        {children as ReactNode}
      </WorkspaceFrame>
    </Suspense>
  );
}
