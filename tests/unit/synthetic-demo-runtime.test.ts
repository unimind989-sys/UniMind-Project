import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resolveDemoRuntime } from "../../src/lib/demo/demo-runtime.application";

const refresh = vi.hoisted(() => vi.fn());
vi.mock("../../src/lib/auth/refresh-session.server", () => ({
  refreshSupabaseSession: refresh,
}));
const safe = {
  NODE_ENV: "development",
  UNIMIND_SYNTHETIC_DEMO: "true",
  APP_ORIGIN: "http://127.0.0.1:3102",
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-credential-only",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-server-credential-only",
  RAW_STORAGE_CREDENTIAL: "synthetic-server-credential-only",
  PROCESSED_STORAGE_CREDENTIAL: "synthetic-server-credential-only",
  QUEUE_SIGNING_SECRET: "synthetic-server-credential-only",
  DATABASE_URL:
    "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/synthetic_demo",
  PROVIDER_MODE: "mock",
  APPROVED_PROVIDER_BUDGET_MINOR: "0",
  GENERATION_PROVIDER_ENABLED: "false",
  EMBEDDING_PROVIDER_ENABLED: "false",
  TRANSCRIPTION_PROVIDER_ENABLED: "false",
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("explicit synthetic runtime", () => {
  it("requires explicit opt-in; ordinary runtime is unchanged", async () => {
    expect(
      resolveDemoRuntime({ ...safe, UNIMIND_SYNTHETIC_DEMO: undefined }),
    ).toBe("DISABLED");
    vi.stubEnv("UNIMIND_SYNTHETIC_DEMO", "false");
    const { proxy } = await import("../../src/proxy");
    await proxy(
      new NextRequest(
        "https://app.unimind.invalid/admin?fixture=ready&role=admin",
      ),
    );
    expect(refresh).toHaveBeenCalledOnce();
  });
  it.each(Object.keys(safe).filter((key) => key !== "UNIMIND_SYNTHETIC_DEMO"))(
    "fails closed when %s differs",
    (key) => {
      expect(resolveDemoRuntime({ ...safe, [key]: "unapproved-value" })).toBe(
        "INVALID",
      );
    },
  );
  it.each([
    "/login",
    "/register",
    "/consent",
    "/learn",
    "/learn/synthetic-credit-cohort/synthetic-credit-unit/quiz/sample-attempt",
    "/admin",
    "/batch-leader",
    "/settings",
    "/auth/callback",
  ])("rewrites %s without Auth or cookies", async (path) => {
    for (const [key, value] of Object.entries(safe)) vi.stubEnv(key, value);
    const { proxy } = await import("../../src/proxy");
    const response = await proxy(
      new NextRequest(`http://127.0.0.1:3102${path}`, {
        headers: {
          host: "localhost:3102",
          "x-forwarded-host": "127.0.0.1:3102",
        },
      }),
    );
    expect(response.headers.get("x-middleware-rewrite")).toContain(
      `/synthetic-runtime${path}`,
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.cookies.getAll()).toEqual([]);
    expect(refresh).not.toHaveBeenCalled();
  });
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "rejects every %s rather than invoking a service",
    async (method) => {
      for (const [key, value] of Object.entries(safe)) vi.stubEnv(key, value);
      const { proxy } = await import("../../src/proxy");
      const response = await proxy(
        new NextRequest("http://127.0.0.1:3102/login", {
          method,
          headers: { host: "127.0.0.1:3102" },
        }),
      );
      expect(response.status).toBe(403);
      expect(refresh).not.toHaveBeenCalled();
    },
  );
  it.each([
    "/api/batch-leader/campaigns/sample/uploads",
    "/api/preview/batch-leader/campaigns/sample/uploads",
    "/api/health/live",
    "/api/private/source.png",
  ])("rejects API %s even on GET", async (path) => {
    for (const [key, value] of Object.entries(safe)) vi.stubEnv(key, value);
    const { proxy } = await import("../../src/proxy");
    expect(
      (
        await proxy(
          new NextRequest(`http://127.0.0.1:3102${path}`, {
            headers: { host: "127.0.0.1:3102" },
          }),
        )
      ).status,
    ).toBe(403);
    expect(refresh).not.toHaveBeenCalled();
  });
  it("blocks non-loopback and production before Auth", async () => {
    for (const [key, value] of Object.entries(safe)) vi.stubEnv(key, value);
    const { proxy } = await import("../../src/proxy");
    expect(
      (
        await proxy(
          new NextRequest("http://127.0.0.1:3102/admin", {
            headers: { host: "attacker.invalid" },
          }),
        )
      ).status,
    ).toBe(503);
    vi.stubEnv("NODE_ENV", "production");
    expect(
      (
        await proxy(
          new NextRequest("http://127.0.0.1:3102/admin", {
            headers: { host: "127.0.0.1:3102" },
          }),
        )
      ).status,
    ).toBe(503);
    expect(refresh).not.toHaveBeenCalled();
  });
});
