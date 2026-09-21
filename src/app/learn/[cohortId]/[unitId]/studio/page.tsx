import { WorkspacePlaceholder } from "@/app/learn/_components/workspace-pages";
import { resolveLocale } from "@/lib/i18n/locale";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";

export default async function StudioPage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  await requireAuthorizedWorkspace(cohortId, unitId);
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  return <WorkspacePlaceholder locale={locale} kind="studio" />;
}
