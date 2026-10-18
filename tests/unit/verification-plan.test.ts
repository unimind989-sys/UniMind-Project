import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  checkComponents,
  planVerification,
  verifyCiComponents,
} from "../../scripts/lib/verification-plan";

const scripts = (
  JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  }
).scripts;
const verifyCi = verifyCiComponents(scripts["verify:ci"] ?? "");

describe("local verification plan", () => {
  it("runs exactly the verify:ci components, each once", () => {
    const planned = planVerification("verify", verifyCi).flatMap(
      (stage) => stage.components,
    );
    expect([...planned].sort()).toEqual([...verifyCi].sort());
    expect(new Set(planned).size).toBe(planned.length);
  });

  it("runs static checks together, then the build before the browser suites", () => {
    const [statics, tests] = planVerification("verify", verifyCi);
    expect(statics?.parallel).toBe(true);
    expect(statics?.components.some((name) => name.startsWith("test:"))).toBe(
      false,
    );
    expect(tests?.parallel).toBe(false);
    expect(tests?.components[0]).toBe("test:env-build");
    expect(tests?.components).toEqual([
      "test:env-build",
      ...verifyCi.filter(
        (name) => name.startsWith("test:") && name !== "test:env-build",
      ),
    ]);
  });

  it("only plans scripts that exist", () => {
    for (const component of [...verifyCi, ...checkComponents])
      expect(scripts[component], component).toBeTypeOf("string");
    expect(scripts.verify).toBe("tsx scripts/run-verify.ts verify");
    expect(scripts.check).toBe("tsx scripts/run-verify.ts check");
  });

  it("rejects a verify:ci the CI policy could not audit", () => {
    expect(() => verifyCiComponents("pnpm lint; pnpm typecheck")).toThrow();
    expect(() => verifyCiComponents("")).toThrow();
  });

  it("keeps the production build type-checking, since verify:ci has no plain typecheck", () => {
    expect(verifyCi).not.toContain("typecheck");
    expect(verifyCi).toContain("typecheck:fresh");
    expect(verifyCi).toContain("test:env-build");
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toMatch(/ignoreBuildErrors:\s*false/u);
    expect(config).not.toMatch(/ignoreBuildErrors:\s*true/u);
  });
});
