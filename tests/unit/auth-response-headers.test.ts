import { describe, expect, it } from "vitest";
import {
  assertAuthHeadersCoveredByProxy,
  authResponseHeaders,
} from "../../src/lib/auth/auth-response-headers.application";

describe("Auth Server Action response policy", () => {
  it("covers every header emitted by the pinned Supabase cookie writer", () => {
    expect(() =>
      assertAuthHeadersCoveredByProxy({
        "Cache-Control":
          "private, no-cache, no-store, must-revalidate, max-age=0",
        Expires: "0",
        Pragma: "no-cache",
      }),
    ).not.toThrow();
    expect(authResponseHeaders["cache-control"]).toContain("private");
    expect(authResponseHeaders["cache-control"]).toContain("no-store");
  });

  it("rejects an unsupported or weaker provider policy instead of dropping it", () => {
    for (const headers of [
      { "Set-Cookie": "unsupported" },
      { "Cache-Control": "public, max-age=3600" },
      { Expires: "tomorrow" },
    ]) {
      expect(() => assertAuthHeadersCoveredByProxy(headers)).toThrow(
        "Unsupported Auth response header",
      );
    }
  });
});
