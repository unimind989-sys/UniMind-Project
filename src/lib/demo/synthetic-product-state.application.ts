import type { AcademicContext } from "../account/account.application";
import type { QuizConfiguration } from "../quiz/quiz-fixture.application";
import type { SyntheticRole } from "./synthetic-account.application";
import type { AdminPreviewContext } from "./synthetic-admin-context.application";
import type { ReviewState } from "./synthetic-fixtures.application";

export type ProductState = Omit<ReviewState, "attempts"> & {
  attempts: Record<
    string,
    {
      inspectionKey: string;
      answers: number[];
      submitted: boolean;
      configuration: QuizConfiguration;
      expiresAt?: number;
      abandoned?: boolean;
    }
  >;
  role: SyntheticRole | null;
  /** The demo account signed in to this document, if any. */
  accountEmail: string | null;
  /** Null until the profile step runs, as for a newly registered account. */
  displayName: string | null;
  /** Names saved in this document, so a loopback re-sign-in is a returning user. */
  profiles: Record<string, string>;
  studyLanguage: "en" | "ar" | "mixed" | null;
  evidenceHintSeen: boolean;
  verified: boolean;
  recoveryToken: boolean;
  verificationUsed: boolean;
  invitationUsed: boolean;
  qualityConflictSessionId: number | null;
  returnPath: string | null;
  pendingActors: Record<string, "AHMED" | "ZIAD">;
  pendingReasons: Record<string, string>;
  pendingHoldExpiries: Record<string, string>;
  pendingVersions: Record<string, number>;
  adminPreview: AdminPreviewContext | null;
  catalogChoice: "MODULE" | "SUBJECT";
  chatDrafts: Record<
    string,
    { message: string; language: "en" | "ar" | "mixed" }
  >;
  lastStudyPath: string | null;
  studioDrafts: ProductState["artifacts"];
  quizDrafts: Record<string, QuizConfiguration>;
  academicContext: AcademicContext | null;
};
