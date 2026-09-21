import { WorkspaceChat } from "@/app/learn/_components/workspace-pages";
import { resolveLocale } from "@/lib/i18n/locale";
import { resolveWorkspaceChat } from "@/lib/workspace/workspace.application";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import { supabaseWorkspaceRepository } from "@/lib/workspace/workspace.supabase.server";

import { startChatSession } from "./actions";

export default async function ChatPage({
  params,
  searchParams,
}: PageProps<"/learn/[cohortId]/[unitId]/chat">) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  const requestedSession = Array.isArray(query.session)
    ? query.session[0]
    : query.session;
  const { sessions, selectedSession } = await resolveWorkspaceChat(
    supabaseWorkspaceRepository,
    scope,
    requestedSession,
  );
  return (
    <WorkspaceChat
      scope={scope}
      locale={locale}
      basePath={`/learn/${cohortId}/${unitId}`}
      sessions={sessions}
      selectedSession={selectedSession}
      startAction={startChatSession}
    />
  );
}
