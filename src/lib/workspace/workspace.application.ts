export type WorkspaceLocale = "en" | "ar";

export type WorkspaceScope = Readonly<{
  cohortId: string;
  unitId: string;
  unitType: "MODULE" | "SUBJECT";
  progressionMode: "TERM_BASED" | "FLEXIBLE_CREDIT";
  stageNameEn: string;
  stageNameAr: string;
  institutionNameEn: string;
  institutionNameAr: string;
  programNameEn: string;
  programNameAr: string;
  levelNameEn: string;
  levelNameAr: string;
  termNameEn: string;
  termNameAr: string;
  cohortName: string;
  curriculumEdition: string;
  unitTitleEn: string;
  unitTitleAr: string;
  unitLabelSingularEn: string;
  unitLabelPluralEn: string;
  unitLabelSingularAr: string;
  unitLabelPluralAr: string;
  sourceCount: number;
  materialUpdatedAt: string;
  sourceStatus: "READY";
  quotaStatus: "UNAVAILABLE";
}>;

export type WorkspaceChatSession = Readonly<{
  id: string;
  cohortId: string;
  unitId: string;
  languageMode: "EN" | "AR_EG" | "MIXED";
  createdAt: string;
}>;

export type WorkspaceRepository = Readonly<{
  loadScope(cohortId: string, unitId: string): Promise<WorkspaceScope | null>;
  listOpenChatSessions(
    scope: Pick<WorkspaceScope, "cohortId" | "unitId">,
  ): Promise<readonly WorkspaceChatSession[]>;
  createChatSession(
    scope: Pick<WorkspaceScope, "cohortId" | "unitId">,
    languageMode: WorkspaceChatSession["languageMode"],
  ): Promise<WorkspaceChatSession>;
}>;

export class WorkspaceDataError extends Error {
  constructor() {
    super("The authorized workspace could not be loaded.");
    this.name = "WorkspaceDataError";
  }
}

function belongsToScope(
  session: WorkspaceChatSession,
  scope: Pick<WorkspaceScope, "cohortId" | "unitId">,
) {
  return session.cohortId === scope.cohortId && session.unitId === scope.unitId;
}

export async function resolveWorkspace(
  repository: WorkspaceRepository,
  cohortId: string,
  unitId: string,
) {
  return repository.loadScope(cohortId, unitId);
}

export async function resolveWorkspaceChat(
  repository: WorkspaceRepository,
  scope: WorkspaceScope,
  requestedSessionId?: string,
) {
  const sessions = await repository.listOpenChatSessions(scope);
  if (sessions.some((session) => !belongsToScope(session, scope))) {
    throw new WorkspaceDataError();
  }

  const selectedSession =
    requestedSessionId === undefined
      ? (sessions[0] ?? null)
      : (sessions.find((session) => session.id === requestedSessionId) ?? null);

  return { sessions, selectedSession } as const;
}

export async function startWorkspaceChat(
  repository: WorkspaceRepository,
  scope: WorkspaceScope,
  locale: WorkspaceLocale,
) {
  const session = await repository.createChatSession(
    scope,
    locale === "ar" ? "AR_EG" : "EN",
  );
  if (!belongsToScope(session, scope)) {
    throw new WorkspaceDataError();
  }
  return session;
}
