export type SyntheticRole = "student" | "leader" | "admin" | "second-admin";

// Public, invented fixture credentials select browser services, never Auth.
export const syntheticPassword = "Synthetic-study-2026!";
export const syntheticAccounts: Readonly<Record<string, SyntheticRole>> = {
  "student@example.invalid": "student",
  "leader@example.invalid": "leader",
  "admin@example.invalid": "admin",
  "second-admin@example.invalid": "second-admin",
};

export function syntheticLoginRole(email: unknown, password: unknown) {
  if (typeof email !== "string" || password !== syntheticPassword) return null;
  const normalized = email.trim().toLowerCase();
  return Object.hasOwn(syntheticAccounts, normalized)
    ? syntheticAccounts[normalized]!
    : null;
}
