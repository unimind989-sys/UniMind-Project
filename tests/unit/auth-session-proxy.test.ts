import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const syntheticUrl = "https://synthetic.supabase.invalid";
const syntheticPublishableKey = "synthetic-publishable-key";
const verifiedUserId = "5f6b38b2-1040-4bce-8d65-4db44d755b0c";

type CookieToSet = Readonly<{
  name: string;
  value: string;
  options: Readonly<Record<string, unknown>>;
}>;

type CookieAdapter = Readonly<{
  getAll: () => unknown;
  setAll: (
    cookiesToSet: readonly CookieToSet[],
    responseHeaders: Readonly<Record<string, string>>,
  ) => void;
}>;

let capturedAdapter: CookieAdapter;

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));
vi.mock("../../src/lib/config/env.client", () => ({
  clientEnvironment: {
    NEXT_PUBLIC_SUPABASE_URL: syntheticUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticPublishableKey,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerClient.mockImplementation(
    (_url: string, _key: string, options: { cookies: CookieAdapter }) => {
      capturedAdapter = options.cookies;
      return {
        auth: {
          getClaims: mocks.getClaims,
        },
      };
    },
  );
  mocks.getClaims.mockResolvedValue({
    data: {
      claims: {
        sub: verifiedUserId,
      },
    },
    error: null,
  });
});

describe("Supabase session proxy", () => {
  it("keeps health probes independent from Auth refresh", async () => {
    const { config } = await import("../../src/proxy");

    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/api/health/live",
      }),
    ).toBe(false);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/api/health/ready",
      }),
    ).toBe(false);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/dashboard",
      }),
    ).toBe(true);
  });

  it("refreshes request and response cookies with private no-cache headers", async () => {
    mocks.getClaims.mockImplementation(async () => {
      capturedAdapter.setAll(
        [
          {
            name: "synthetic-session",
            value: "refreshed-cookie",
            options: {
              httpOnly: true,
              sameSite: "lax",
            },
          },
        ],
        {
          "cache-control":
            "private, no-cache, no-store, must-revalidate, max-age=0",
          expires: "0",
          pragma: "no-cache",
        },
      );
      return {
        data: {
          claims: {
            sub: verifiedUserId,
          },
        },
        error: null,
      };
    });

    const request = new NextRequest("https://app.unimind.invalid/dashboard", {
      headers: {
        cookie: "synthetic-session=stale-cookie",
      },
    });
    const { refreshSupabaseSession } =
      await import("../../src/lib/auth/refresh-session.server");
    const response = await refreshSupabaseSession(request);

    expect(mocks.createServerClient).toHaveBeenCalledWith(
      syntheticUrl,
      syntheticPublishableKey,
      expect.any(Object),
    );
    expect(mocks.getClaims).toHaveBeenCalledOnce();
    expect(request.cookies.get("synthetic-session")?.value).toBe(
      "refreshed-cookie",
    );
    expect(response.cookies.get("synthetic-session")?.value).toBe(
      "refreshed-cookie",
    );
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("does not treat an unverifiable cookie as an authenticated identity", async () => {
    mocks.getClaims.mockResolvedValue({
      data: null,
      error: new Error("invalid JWT signature"),
    });

    const request = new NextRequest("https://app.unimind.invalid/");
    const { refreshSupabaseSession } =
      await import("../../src/lib/auth/refresh-session.server");
    const response = await refreshSupabaseSession(request);

    expect(mocks.getClaims).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.cookies.getAll()).toEqual([]);
  });
});
