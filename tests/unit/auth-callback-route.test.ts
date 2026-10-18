import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
  getCurrentAuthAccess: vi.fn(),
  currentRoleHome: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      verifyOtp: mocks.verifyOtp,
    },
  }),
}));
vi.mock("@/lib/auth/auth-access.supabase.server", () => ({
  getCurrentAuthAccess: mocks.getCurrentAuthAccess,
}));
vi.mock("@/lib/account/account.supabase.server", () => ({
  currentRoleHome: mocks.currentRoleHome,
}));
vi.mock("@/lib/config/env.server", () => ({
  getServerEnvironment: () => ({ APP_ORIGIN: "https://app.unimind.invalid" }),
}));

const origin = "https://app.unimind.invalid";

async function callback(query: string) {
  const { GET } = await import("../../src/app/auth/callback/route");
  return GET(new NextRequest(`${origin}/auth/callback?${query}`));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  mocks.verifyOtp.mockResolvedValue({ error: null });
  mocks.getCurrentAuthAccess.mockResolvedValue({ gate: "READY" });
  mocks.currentRoleHome.mockResolvedValue("/learn");
});

// WP03-T28: an email link returns in the language it was sent in.
describe("auth callback language", () => {
  it("keeps lang on a successful return to the role home", async () => {
    const response = await callback("code=synthetic&next=%2Flearn&lang=ar");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${origin}/learn?lang=ar`);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("keeps lang on the gate the account still owes", async () => {
    mocks.getCurrentAuthAccess.mockResolvedValue({ gate: "CONSENT_REQUIRED" });
    const response = await callback("code=synthetic&next=%2Flearn&lang=ar");
    const location = new URL(response.headers.get("location")!);
    expect(location.origin).toBe(origin);
    expect(location.pathname).toBe("/consent");
    expect(location.searchParams.get("lang")).toBe("ar");
  });

  it("keeps lang on an expired link and on password recovery", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      error: { code: "otp_expired" },
    });
    const expired = await callback("code=synthetic&lang=ar");
    expect(expired.headers.get("location")).toBe(
      `${origin}/verify-email?status=expired_link&lang=ar`,
    );
    const recovery = await callback(
      "token_hash=synthetic&type=recovery&next=%2Freset-password&lang=ar",
    );
    expect(recovery.headers.get("location")).toBe(
      `${origin}/reset-password?lang=ar`,
    );
  });

  it.each(["%2F%2Fattacker.invalid", "fr", "AR"])(
    "drops an unsupported lang value %s and stays on the app origin",
    async (lang) => {
      const response = await callback(`code=synthetic&lang=${lang}`);
      const location = new URL(response.headers.get("location")!);
      expect(location.origin).toBe(origin);
      expect(location.pathname).toBe("/learn");
      expect(location.searchParams.has("lang")).toBe(false);
    },
  );
});
