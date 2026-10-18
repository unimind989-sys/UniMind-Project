import { isProfileComplete } from "../account/profile.domain";
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
  getAccountState(
    userId: string,
  ): Promise<Readonly<{ status: AccountStatus; displayName: string }> | null>;
  getCurrentTerms(): Promise<CurrentTerms | null>;
  hasAcceptedTerms(userId: string, termsVersionId: string): Promise<boolean>;
  acceptCurrentTerms(userId: string, terms: CurrentTerms): Promise<void>;
}

export async function readAuthAccess(
  repository: AuthAccessRepository,
): Promise<AuthAccessSnapshot> {
  const userId = await repository.getVerifiedUserId();
  if (userId === null) return { gate: "SIGN_IN", currentTerms: null };

  const account = await repository.getAccountState(userId);
  if (account === null) {
    return { gate: "ACCOUNT_PENDING", currentTerms: null };
  }
  const accountStatus = account.status;

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
        hasCompleteProfile: isProfileComplete(account.displayName),
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
      hasCompleteProfile: isProfileComplete(account.displayName),
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
