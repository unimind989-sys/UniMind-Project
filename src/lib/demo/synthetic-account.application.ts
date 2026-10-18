export type SyntheticRole = "student" | "leader" | "admin" | "second-admin";

export type SyntheticAccount = Readonly<{
  role: SyntheticRole;
  /** The profile the account starts with; null means a brand-new account. */
  displayName: string | null;
}>;

// Public, invented fixture credentials select browser services, never Auth.
export const syntheticPassword = "Synthetic-study-2026!";
export const syntheticAccounts: Readonly<Record<string, SyntheticAccount>> = {
  "student@example.invalid": { role: "student", displayName: "Samir Hassan" },
  // A genuinely new student: no name yet, so the first-run profile step and
  // the academic setup run exactly as they do for a newly registered account.
  "new-student@example.invalid": { role: "student", displayName: null },
  "leader@example.invalid": { role: "leader", displayName: "Mona Ali" },
  "admin@example.invalid": { role: "admin", displayName: "Ahmed (sample)" },
  "second-admin@example.invalid": {
    role: "second-admin",
    displayName: "Ziad (sample)",
  },
};

/** The account a hosted sign-in enters the synthetic runtime with. */
export type SyntheticEntryAccount = SyntheticAccount &
  Readonly<{ email: string }>;

/** The approved account behind an exact demo pair, with its normalized email. */
export function syntheticLoginAccount(
  email: unknown,
  password: unknown,
): SyntheticEntryAccount | null {
  if (typeof email !== "string" || password !== syntheticPassword) return null;
  const normalized = email.trim().toLowerCase();
  return Object.hasOwn(syntheticAccounts, normalized)
    ? { ...syntheticAccounts[normalized]!, email: normalized }
    : null;
}

export function syntheticLoginRole(email: unknown, password: unknown) {
  return syntheticLoginAccount(email, password)?.role ?? null;
}

/** The approved account for an email alone (loopback screens check the password separately). */
export function syntheticAccountFor(email: unknown) {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  return Object.hasOwn(syntheticAccounts, normalized)
    ? syntheticAccounts[normalized]!
    : null;
}
