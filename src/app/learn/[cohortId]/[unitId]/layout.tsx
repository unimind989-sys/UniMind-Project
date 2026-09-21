import { Suspense, type ReactNode } from "react";

import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/learn/[cohortId]/[unitId]">) {
  const { cohortId, unitId } = await params;
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceFrame scope={scope}>{children as ReactNode}</WorkspaceFrame>
    </Suspense>
  );
}
