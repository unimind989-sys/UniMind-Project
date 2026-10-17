import { RealStudyPage } from "@/app/learn/_components/real-study-page";
import { LiveStudyProvider } from "@/app/learn/_components/study/live-study";
import { resolveWorkspaceChat } from "@/lib/workspace/workspace.application";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";
import { supabaseWorkspaceRepository } from "@/lib/workspace/workspace.supabase.server";

import { startChatSession } from "./actions";

export default function ChatPage(props: WorkspacePageProps) {
  return (
    <RealStudyPage
      {...props}
      screen="chat"
      wrap={async (content, { scope, query }) => {
        const requestedSession = Array.isArray(query.session)
          ? query.session[0]
          : query.session;
        const { sessions, selectedSession } = await resolveWorkspaceChat(
          supabaseWorkspaceRepository,
          scope,
          typeof requestedSession === "string" ? requestedSession : undefined,
        );
        return (
          <LiveStudyProvider
            value={{
              chat: {
                sessions,
                selectedSessionId: selectedSession?.id ?? null,
                startAction: startChatSession,
              },
            }}
          >
            {content}
          </LiveStudyProvider>
        );
      }}
    />
  );
}
