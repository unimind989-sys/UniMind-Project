import { describe, expect, it } from "vitest";
import {
  syntheticAccountFor,
  syntheticAccounts,
  syntheticLoginAccount,
  syntheticLoginRole,
  syntheticPassword,
} from "../../src/lib/demo/synthetic-account.application";

describe("synthetic credential selection", () => {
  it.each(["student", "leader", "admin", "second-admin"] as const)(
    "selects only the approved %s pair",
    (role) => {
      expect(
        syntheticLoginRole(`${role}@example.invalid`, syntheticPassword),
      ).toBe(role);
      expect(
        syntheticLoginRole(`${role}@example.invalid`, "wrong-password"),
      ).toBeNull();
    },
  );
  it("offers exactly five pairs, one of them a brand-new student without a profile", () => {
    expect(Object.keys(syntheticAccounts).sort()).toEqual([
      "admin@example.invalid",
      "leader@example.invalid",
      "new-student@example.invalid",
      "second-admin@example.invalid",
      "student@example.invalid",
    ]);
    expect(
      syntheticLoginAccount("New-Student@example.invalid ", syntheticPassword),
    ).toEqual({
      role: "student",
      displayName: null,
      email: "new-student@example.invalid",
    });
    expect(
      syntheticLoginAccount("student@example.invalid", syntheticPassword),
    ).toMatchObject({ displayName: "Samir Hassan" });
    expect(
      syntheticLoginAccount("new-student@example.invalid", "wrong-password"),
    ).toBeNull();
  });
  it.each([
    "student@real.invalid",
    "constructor",
    "toString",
    "__proto__",
    "",
    null,
    { role: "admin" },
  ])("does not select a role from %s", (email) => {
    expect(syntheticLoginRole(email, syntheticPassword)).toBeNull();
    expect(syntheticAccountFor(email)).toBeNull();
  });
  it("normalizes only the email; password matching is exact", () => {
    expect(
      syntheticLoginRole(" Student@Example.Invalid ", syntheticPassword),
    ).toBe("student");
    expect(
      syntheticLoginRole("student@example.invalid", `${syntheticPassword} `),
    ).toBeNull();
  });
});
