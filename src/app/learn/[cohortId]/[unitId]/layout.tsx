import { Suspense } from "react";

import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import type { WorkspaceLayoutProps } from "@/lib/workspace/workspace-route.types";

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { cohortId, unitId } = await params;
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceFrame scope={scope}>{children}</WorkspaceFrame>
    </Suspense>
  );
}
