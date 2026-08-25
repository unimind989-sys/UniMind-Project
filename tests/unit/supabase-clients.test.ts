import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const syntheticUrl = "https://synthetic.supabase.invalid";
const syntheticPublishableKey = "synthetic-publishable-key";
const syntheticServiceRoleKey = "synthetic-service-role-key";

const mocks = vi.hoisted(() => ({
  createBrowserClient: vi.fn(),
  createServerClient: vi.fn(),
  cookies: vi.fn(),
  cookieGetAll: vi.fn(),
  cookieSet: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: mocks.createBrowserClient,
  createServerClient: mocks.createServerClient,
}));
vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

type CookieToSet = Readonly<{
  name: string;
  value: string;
  options: Readonly<Record<string, unknown>>;
}>;

type CookieAdapter = Readonly<{
  getAll: () => unknown;
  setAll: (cookiesToSet: readonly CookieToSet[]) => void;
}>;

function stubPublicEnvironment(): void {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", syntheticUrl);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", syntheticPublishableKey);
  vi.stubEnv("NEXT_PUBLIC_RELEASE_ID", "supabase-client-unit-test");
  vi.stubEnv("NEXT_PUBLIC_TELEMETRY_ENABLED", "false");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", syntheticServiceRoleKey);
}

function capturedCookieAdapter(): CookieAdapter {
  const options = mocks.createServerClient.mock.calls[0]?.[2] as
    { cookies: CookieAdapter } | undefined;

  expect(options).toBeDefined();
  return options!.cookies;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  stubPublicEnvironment();

  mocks.createBrowserClient.mockReturnValue({ kind: "browser-client" });
  mocks.createServerClient.mockReturnValue({ kind: "server-client" });
  mocks.cookieGetAll.mockReturnValue([
    { name: "synthetic-session", value: "synthetic-cookie" },
  ]);
  mocks.cookies.mockResolvedValue({
    getAll: mocks.cookieGetAll,
    set: mocks.cookieSet,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase client factories", () => {
  it("creates the browser client with publishable configuration only", async () => {
    const { createBrowserSupabaseClient } =
      await import("../../src/lib/db/supabase/browser");

    expect(createBrowserSupabaseClient()).toEqual({ kind: "browser-client" });
    expect(mocks.createBrowserClient).toHaveBeenCalledWith(
      syntheticUrl,
      syntheticPublishableKey,
    );
    expect(JSON.stringify(mocks.createBrowserClient.mock.calls)).not.toContain(
      syntheticServiceRoleKey,
    );
  });

  it("creates a fresh cookie-aware server client for every request", async () => {
    const { createServerSupabaseClient } =
      await import("../../src/lib/db/supabase/server");

    await createServerSupabaseClient();
    await createServerSupabaseClient();

    expect(mocks.cookies).toHaveBeenCalledTimes(2);
    expect(mocks.createServerClient).toHaveBeenCalledTimes(2);
    expect(mocks.createServerClient).toHaveBeenNthCalledWith(
      1,
      syntheticUrl,
      syntheticPublishableKey,
      expect.any(Object),
    );
    expect(JSON.stringify(mocks.createServerClient.mock.calls)).not.toContain(
      syntheticServiceRoleKey,
    );
  });

  it("reads and writes through the current Next.js cookie store", async () => {
    const { createServerSupabaseClient } =
      await import("../../src/lib/db/supabase/server");
    await createServerSupabaseClient();

    const cookieAdapter = capturedCookieAdapter();
    expect(cookieAdapter.getAll()).toEqual([
      { name: "synthetic-session", value: "synthetic-cookie" },
    ]);

    const cookie = {
      name: "synthetic-session",
      value: "updated-cookie",
      options: { httpOnly: true, sameSite: "lax" },
    };
    cookieAdapter.setAll([cookie]);

    expect(mocks.cookieGetAll).toHaveBeenCalledOnce();
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      cookie.name,
      cookie.value,
      cookie.options,
    );
  });

  it("does not fail a Server Component when its cookie store is read-only", async () => {
    mocks.cookieSet.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a writable request.");
    });

    const { createServerSupabaseClient } =
      await import("../../src/lib/db/supabase/server");
    await createServerSupabaseClient();

    expect(() =>
      capturedCookieAdapter().setAll([
        {
          name: "synthetic-session",
          value: "updated-cookie",
          options: { httpOnly: true },
        },
      ]),
    ).not.toThrow();
  });
});
