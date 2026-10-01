import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { themeBootstrap } from "../../src/lib/theme/theme.application";

function beforePaint(value: unknown, dark: boolean, denied = false) {
  const root = { dataset: {} };
  runInNewContext(themeBootstrap, {
    document: { documentElement: root, querySelector: () => null },
    localStorage: {
      getItem: () => {
        if (denied) throw new Error("denied");
        return value;
      },
    },
    matchMedia: () => ({ matches: dark }),
  });
  return root.dataset;
}
describe("appearance before first paint", () => {
  it.each([
    ["dark", "#1b1c1f"],
    ["light", "#f6f7f8"],
  ])("sets browser chrome for saved %s before hydration", (saved, color) => {
    const setAttribute = vi.fn();
    runInNewContext(themeBootstrap, {
      document: {
        documentElement: { dataset: {} },
        querySelector: () => ({ setAttribute }),
      },
      localStorage: { getItem: () => saved },
      matchMedia: () => ({ matches: false }),
    });
    expect(setAttribute).toHaveBeenCalledWith("content", color);
  });
  it.each([true, false])(
    "follows system appearance with no saved setting (%s)",
    (dark) => {
      expect(beforePaint(null, dark)).toEqual({
        themePreference: "system",
        theme: dark ? "dark" : "light",
      });
    },
  );
  it("honors an explicit saved choice before hydration", () => {
    expect(beforePaint("light", true)).toEqual({
      themePreference: "light",
      theme: "light",
    });
    expect(beforePaint("dark", false)).toEqual({
      themePreference: "dark",
      theme: "dark",
    });
  });
  it("tolerates unavailable storage and rejects unrecognized values", () => {
    expect(beforePaint("dark", false, true)).toEqual({
      themePreference: "system",
      theme: "light",
    });
    expect(beforePaint("<script>fixture</script>", true)).toEqual({
      themePreference: "system",
      theme: "dark",
    });
  });
});
