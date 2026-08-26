import { describe, expect, it } from "vitest";

import { parseHostedAuthCommand } from "../../scripts/lib/hosted-auth-command";

describe("hosted Auth command guard", () => {
  it("uses the ignored file profile for local development by default", () => {
    expect(parseHostedAuthCommand(["--environment", "development"])).toEqual({
      environment: "development",
      profileSource: "file",
    });
  });

  it("accepts an explicit environment-backed CI profile", () => {
    expect(
      parseHostedAuthCommand([
        "--environment",
        "ci",
        "--profile-source",
        "environment",
      ]),
    ).toEqual({ environment: "ci", profileSource: "environment" });
  });

  it("rejects environment-backed development and every forbidden target", () => {
    expect(() =>
      parseHostedAuthCommand([
        "--environment",
        "development",
        "--profile-source",
        "environment",
      ]),
    ).toThrow("Environment profile source is restricted to ci");

    expect(() => parseHostedAuthCommand(["--environment", "preview"])).toThrow(
      "development or ci",
    );
  });
});
