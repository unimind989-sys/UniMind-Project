import { WorkspaceOverview } from "@/app/learn/_components/workspace-pages";
import { resolveLocale } from "@/lib/i18n/locale";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";

export default async function WorkspaceOverviewPage({
  params,
  searchParams,
}: PageProps<"/learn/[cohortId]/[unitId]">) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  return (
    <WorkspaceOverview
      scope={scope}
      locale={locale}
      basePath={`/learn/${cohortId}/${unitId}`}
    />
  );
}
