import { describe, expect, it, vi } from "vitest";

import {
  resolveWorkspace,
  resolveWorkspaceChat,
  startWorkspaceChat,
  WorkspaceDataError,
  type WorkspaceRepository,
  type WorkspaceScope,
} from "../../src/lib/workspace/workspace.application";

const scope: WorkspaceScope = {
  cohortId: "cohort-a",
  unitId: "unit-a",
  unitType: "MODULE",
  progressionMode: "TERM_BASED",
  stageNameEn: "University",
  stageNameAr: "الجامعة",
  institutionNameEn: "Synthetic University",
  institutionNameAr: "جامعة تجريبية",
  programNameEn: "Medicine",
  programNameAr: "الطب",
  levelNameEn: "First year",
  levelNameAr: "السنة الأولى",
  termNameEn: "Term 1",
  termNameAr: "الترم الأول",
  cohortName: "Synthetic cohort",
  curriculumEdition: "synthetic-2026",
  unitTitleEn: "Anatomy",
  unitTitleAr: "علم التشريح",
  unitLabelSingularEn: "Module",
  unitLabelPluralEn: "Modules",
  unitLabelSingularAr: "وحدة",
  unitLabelPluralAr: "وحدات",
  sourceCount: 3,
  materialUpdatedAt: "2026-09-15T12:00:00.000Z",
  sourceStatus: "READY",
  quotaStatus: "UNAVAILABLE",
};

function repository(
  overrides: Partial<WorkspaceRepository> = {},
): WorkspaceRepository {
  return {
    loadScope: vi.fn().mockResolvedValue(scope),
    listOpenChatSessions: vi.fn().mockResolvedValue([]),
    createChatSession: vi.fn().mockResolvedValue({
      id: "session-a",
      cohortId: scope.cohortId,
      unitId: scope.unitId,
      languageMode: "EN",
      createdAt: "2026-09-21T12:00:00.000Z",
    }),
    ...overrides,
  };
}

describe("workspace application boundary", () => {
  it("resolves only the repository-authorized cohort and unit pair", async () => {
    const loadScope = vi.fn().mockResolvedValue(null);
    const result = await resolveWorkspace(
      repository({ loadScope }),
      "forged-cohort",
      "forged-unit",
    );
    expect(result).toBeNull();
    expect(loadScope).toHaveBeenCalledWith("forged-cohort", "forged-unit");
  });

  it("does not select a forged session hint", async () => {
    const session = {
      id: "owned-session",
      cohortId: scope.cohortId,
      unitId: scope.unitId,
      languageMode: "EN" as const,
      createdAt: "2026-09-21T12:00:00.000Z",
    };
    const result = await resolveWorkspaceChat(
      repository({
        listOpenChatSessions: vi.fn().mockResolvedValue([session]),
      }),
      scope,
      "forged-session",
    );
    expect(result.selectedSession).toBeNull();
    expect(result.sessions).toEqual([session]);
  });

  it("rejects a repository row that crosses the canonical workspace scope", async () => {
    const foreign = {
      id: "foreign-session",
      cohortId: "cohort-b",
      unitId: scope.unitId,
      languageMode: "EN" as const,
      createdAt: "2026-09-21T12:00:00.000Z",
    };
    await expect(
      resolveWorkspaceChat(
        repository({
          listOpenChatSessions: vi.fn().mockResolvedValue([foreign]),
        }),
        scope,
      ),
    ).rejects.toBeInstanceOf(WorkspaceDataError);
  });

  it("persists the active locale and exact scope when starting a mock session", async () => {
    const createChatSession = vi.fn().mockResolvedValue({
      id: "session-ar",
      cohortId: scope.cohortId,
      unitId: scope.unitId,
      languageMode: "AR_EG",
      createdAt: "2026-09-21T12:00:00.000Z",
    });
    const result = await startWorkspaceChat(
      repository({ createChatSession }),
      scope,
      "ar",
    );
    expect(createChatSession).toHaveBeenCalledWith(scope, "AR_EG");
    expect(result.id).toBe("session-ar");
  });
});
