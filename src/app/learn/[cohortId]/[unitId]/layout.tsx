import { loadCurrentAccount } from "@/lib/account/account.supabase.server";
import { Suspense } from "react";

import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import type { WorkspaceLayoutProps } from "@/lib/workspace/workspace-route.types";
import { loadCurrentStudentCatalog } from "@/lib/catalog/catalog-journey.supabase.server";

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { cohortId, unitId } = await params;
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  const [catalog, account] = await Promise.all([
    loadCurrentStudentCatalog().catch(() => null),
    loadCurrentAccount().catch(() => null),
  ]);
  const units =
    catalog?.rows
      .filter((row) => row.cohort.id === cohortId)
      .map((row) => row.unit) ?? [];
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceFrame
        scope={scope}
        units={units}
        profileName={account?.displayName}
      >
        {children}
      </WorkspaceFrame>
    </Suspense>
  );
}
