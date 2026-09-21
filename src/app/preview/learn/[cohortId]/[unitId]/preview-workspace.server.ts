import "server-only";

import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import {
  WorkspaceDataError,
  type WorkspaceChatSession,
  type WorkspaceRepository,
} from "@/lib/workspace/workspace.application";

const previewGlobal = globalThis as typeof globalThis & {
  __unimindPreviewWorkspaceSessions?: WorkspaceChatSession[];
};
const sessions = (previewGlobal.__unimindPreviewWorkspaceSessions ??= []);

export const previewWorkspaceRepository: WorkspaceRepository = {
  async loadScope(cohortId, unitId) {
    return loadSyntheticWorkspaceScope(cohortId, unitId);
  },
  async listOpenChatSessions(scope) {
    return sessions
      .filter(
        (session) =>
          session.cohortId === scope.cohortId &&
          session.unitId === scope.unitId,
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },
  async createChatSession(scope, languageMode) {
    if (loadSyntheticWorkspaceScope(scope.cohortId, scope.unitId) === null)
      throw new WorkspaceDataError();
    const session: WorkspaceChatSession = {
      id: crypto.randomUUID(),
      cohortId: scope.cohortId,
      unitId: scope.unitId,
      languageMode,
      createdAt: new Date().toISOString(),
    };
    sessions.push(session);
    return session;
  },
};
