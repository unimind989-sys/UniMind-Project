import { describe, expect, it } from "vitest";
import {
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
