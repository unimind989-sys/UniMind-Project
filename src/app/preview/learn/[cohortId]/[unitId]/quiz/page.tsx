import { notFound } from "next/navigation";

import { WorkspacePlaceholder } from "@/app/learn/_components/workspace-pages";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import { resolveLocale } from "@/lib/i18n/locale";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";

export default async function PreviewQuizPage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  if (
    (Array.isArray(query.state) ? query.state[0] : query.state) ===
    "deactivated"
  )
    notFound();
  if (loadSyntheticWorkspaceScope(cohortId, unitId) === null) notFound();
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  return <WorkspacePlaceholder locale={locale} kind="quiz" />;
}
