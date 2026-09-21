import { notFound } from "next/navigation";

import { WorkspaceChat } from "@/app/learn/_components/workspace-pages";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import { resolveLocale } from "@/lib/i18n/locale";
import { resolveWorkspaceChat } from "@/lib/workspace/workspace.application";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";

import { previewWorkspaceRepository } from "../preview-workspace.server";
import { startPreviewChatSession } from "./actions";

export default async function PreviewChatPage({
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
  const scope = loadSyntheticWorkspaceScope(cohortId, unitId);
  if (scope === null) notFound();
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  const requestedSession = Array.isArray(query.session)
    ? query.session[0]
    : query.session;
  const { sessions, selectedSession } = await resolveWorkspaceChat(
    previewWorkspaceRepository,
    scope,
    requestedSession,
  );
  return (
    <WorkspaceChat
      scope={scope}
      locale={locale}
      basePath={`/preview/learn/${cohortId}/${unitId}`}
      sessions={sessions}
      selectedSession={selectedSession}
      startAction={startPreviewChatSession}
    />
  );
}
