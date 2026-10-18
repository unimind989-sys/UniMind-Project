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
  it.each([
    "/synthetic-runtime",
    "/synthetic-runtime/admin",
    "/synthetic-runtime/login",
  ])(
    "denies local-only review route %s in the normal runtime without Auth",
    async (path) => {
      const { proxy } = await import("../../src/proxy");
      const response = await proxy(
        new NextRequest(
          `https://app.unimind.invalid${path}?role=admin&synthetic=true`,
        ),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.cookies.getAll()).toEqual([]);
      expect(mocks.createServerClient).not.toHaveBeenCalled();
    },
  );
  it.each([
    ["GET", "/preview"],
    ["GET", "/preview/review"],
    ["GET", "/preview/review/access/consent"],
    ["GET", "/preview/learn"],
    ["GET", "/preview/admin?state=containment"],
    ["GET", "/wp03-review.html"],
    ["POST", "/api/preview/batch-leader/campaigns/sample/uploads"],
    ["POST", "/preview/learn/cohort/unit/chat"],
  ])(
    "answers 404 for retired fixture route %s %s without Auth or cookies",
    async (method, path) => {
      const { proxy } = await import("../../src/proxy");
      const request = new NextRequest(`https://app.unimind.invalid${path}`, {
        method,
        headers: {
          cookie: "synthetic-session=untouched-cookie",
          ...(method === "POST" ? { "next-action": "synthetic-action" } : {}),
        },
      });
      const response = await proxy(request);
      expect(response.status).toBe(404);
      expect(mocks.createServerClient).not.toHaveBeenCalled();
      expect(mocks.getClaims).not.toHaveBeenCalled();
      expect(response.cookies.getAll()).toEqual([]);
      expect(request.cookies.get("synthetic-session")?.value).toBe(
        "untouched-cookie",
      );
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    },
  );

  it.each([
    "/learn",
    "/admin",
    "/preview-fake",
    "/api/batch-leader/campaigns/sample/uploads",
  ])("does not bypass real Auth for %s", async (path) => {
    const { proxy } = await import("../../src/proxy");
    await proxy(new NextRequest(`https://app.unimind.invalid${path}`));
    expect(mocks.getClaims).toHaveBeenCalledOnce();
  });

  it("returns a page load without ?lang= in the remembered language before Auth", async () => {
    const { proxy } = await import("../../src/proxy");
    const response = await proxy(
      new NextRequest("https://app.unimind.invalid/register?next=%2Flearn", {
        headers: { cookie: "unimind-locale=ar", "sec-fetch-dest": "document" },
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.unimind.invalid/register?next=%2Flearn&lang=ar",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.getClaims).not.toHaveBeenCalled();
  });

  it("remembers the language a same-origin client navigation names", async () => {
    const { proxy } = await import("../../src/proxy");
    const response = await proxy(
      new NextRequest("https://app.unimind.invalid/login?lang=en", {
        headers: {
          cookie: "unimind-locale=ar",
          "sec-fetch-dest": "empty",
          "sec-fetch-site": "same-origin",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.cookies.get("unimind-locale")).toMatchObject({
      value: "en",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    expect(response.headers.get("x-middleware-request-x-unimind-locale")).toBe(
      "en",
    );
    expect(mocks.getClaims).toHaveBeenCalledOnce();
  });

  it("names the page language for the root layout and replaces a forged one", async () => {
    const { proxy } = await import("../../src/proxy");
    const response = await proxy(
      new NextRequest("https://app.unimind.invalid/learn", {
        headers: { "x-unimind-locale": "ar" },
      }),
    );
    expect(response.headers.get("x-middleware-request-x-unimind-locale")).toBe(
      "en",
    );
    const arabic = await proxy(
      new NextRequest("https://app.unimind.invalid/learn?lang=ar"),
    );
    expect(arabic.headers.get("x-middleware-request-x-unimind-locale")).toBe(
      "ar",
    );
  });

  it("writes nothing when an English link reaches a device that remembers nothing", async () => {
    const { proxy } = await import("../../src/proxy");
    const response = await proxy(
      new NextRequest("https://app.unimind.invalid/login?lang=en", {
        headers: { "sec-fetch-dest": "document" },
      }),
    );
    expect(response.cookies.get("unimind-locale")).toBeUndefined();
  });

  it.each([
    ["a cross-site script request", "GET", "empty", "cross-site"],
    ["a POST", "POST", "empty", "same-origin"],
    ["an embedded frame", "GET", "iframe", "same-origin"],
  ])(
    "does not remember the language from %s",
    async (_name, method, destination, site) => {
      const { proxy } = await import("../../src/proxy");
      const response = await proxy(
        new NextRequest("https://app.unimind.invalid/login?lang=en", {
          method,
          headers: {
            cookie: "unimind-locale=ar",
            "sec-fetch-dest": destination,
            "sec-fetch-site": site,
          },
        }),
      );
      expect(response.cookies.get("unimind-locale")).toBeUndefined();
    },
  );

  it("keeps health probes independent from Auth refresh", async () => {
    const { config, proxy } = await import("../../src/proxy");

    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/api/health/live",
      }),
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/api/health/ready",
      }),
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/dashboard",
      }),
    ).toBe(true);
    await proxy(new NextRequest("https://app.unimind.invalid/api/health/live"));
    await proxy(
      new NextRequest("https://app.unimind.invalid/api/health/ready"),
    );
    expect(mocks.getClaims).not.toHaveBeenCalled();
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
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
  });
});
