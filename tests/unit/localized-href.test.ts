import { describe, expect, it } from "vitest";

import { localizedHref } from "../../src/lib/i18n/locale";

describe("localizedHref", () => {
  it("adds the interface language to a bare internal path", () => {
    expect(localizedHref("/learn", "ar")).toBe("/learn?lang=ar");
  });

  it("keeps every other query parameter and the fragment", () => {
    expect(localizedHref("/learn?view=subjects&q=anatomy#covers", "en")).toBe(
      "/learn?view=subjects&q=anatomy&lang=en#covers",
    );
  });

  it("replaces an earlier language instead of repeating it", () => {
    expect(localizedHref("/settings?lang=en&tab=account", "ar")).toBe(
      "/settings?lang=ar&tab=account",
    );
  });

  it("keeps a fragment-only target on the same path", () => {
    expect(localizedHref("/?lang=ar#how-it-works", "en")).toBe(
      "/?lang=en#how-it-works",
    );
  });

  it("leaves external and scheme addresses unchanged", () => {
    for (const href of [
      "https://example.invalid/page",
      "//example.invalid/page",
      "mailto:help@example.invalid",
    ])
      expect(localizedHref(href, "ar")).toBe(href);
  });
});
