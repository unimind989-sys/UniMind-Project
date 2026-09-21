import { notFound } from "next/navigation";

import { WorkspaceOverview } from "@/app/learn/_components/workspace-pages";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import { resolveLocale } from "@/lib/i18n/locale";

export default async function PreviewWorkspacePage({
  params,
  searchParams,
}: PageProps<"/preview/learn/[cohortId]/[unitId]">) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  if (
    (Array.isArray(query.state) ? query.state[0] : query.state) ===
    "deactivated"
  )
    notFound();
  const scope = loadSyntheticWorkspaceScope(cohortId, unitId);
  if (scope === null) notFound();
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  return (
    <WorkspaceOverview
      scope={scope}
      locale={locale}
      basePath={`/preview/learn/${cohortId}/${unitId}`}
    />
  );
}
