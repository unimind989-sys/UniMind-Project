import {
  resolveAuthGate,
  type AccountStatus,
  type AuthGate,
} from "./auth-flow.domain";

export type CurrentTerms = Readonly<{
  id: string;
  termsVersion: string;
  privacyVersion: string;
  educationalBoundaryVersion: string;
}>;

export type AuthAccessSnapshot = Readonly<{
  gate: AuthGate | "UNAVAILABLE";
  currentTerms: CurrentTerms | null;
}>;

export interface AuthAccessRepository {
  getVerifiedUserId(): Promise<string | null>;
  getAccountStatus(userId: string): Promise<AccountStatus | null>;
  getCurrentTerms(): Promise<CurrentTerms | null>;
  hasAcceptedTerms(userId: string, termsVersionId: string): Promise<boolean>;
  acceptCurrentTerms(userId: string, terms: CurrentTerms): Promise<void>;
}

export async function readAuthAccess(
  repository: AuthAccessRepository,
): Promise<AuthAccessSnapshot> {
  const userId = await repository.getVerifiedUserId();
  if (userId === null) return { gate: "SIGN_IN", currentTerms: null };

  const accountStatus = await repository.getAccountStatus(userId);
  if (accountStatus === null) {
    return { gate: "ACCOUNT_PENDING", currentTerms: null };
  }

  if (accountStatus === "PENDING") {
    return { gate: "VERIFY_EMAIL", currentTerms: null };
  }

  if (accountStatus === "SUSPENDED" || accountStatus === "DISABLED") {
    return {
      gate: resolveAuthGate({
        hasVerifiedIdentity: true,
        emailVerified: true,
        accountStatus,
        hasCurrentConsent: false,
      }),
      currentTerms: null,
    };
  }

  const currentTerms = await repository.getCurrentTerms();
  if (currentTerms === null) return { gate: "UNAVAILABLE", currentTerms: null };

  const hasCurrentConsent = await repository.hasAcceptedTerms(
    userId,
    currentTerms.id,
  );
  return {
    gate: resolveAuthGate({
      hasVerifiedIdentity: true,
      emailVerified: true,
      accountStatus,
      hasCurrentConsent,
    }),
    currentTerms,
  };
}

export async function acceptCurrentConsent(
  repository: AuthAccessRepository,
): Promise<AuthAccessSnapshot> {
  const before = await readAuthAccess(repository);
  if (before.gate !== "CONSENT_REQUIRED" || before.currentTerms === null) {
    return before;
  }

  const userId = await repository.getVerifiedUserId();
  if (userId === null) return { gate: "SIGN_IN", currentTerms: null };
  await repository.acceptCurrentTerms(userId, before.currentTerms);
  return readAuthAccess(repository);
}
