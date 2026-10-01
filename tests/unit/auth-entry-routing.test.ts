import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLocale } from "../../src/lib/i18n/locale";
import { validatedInternalReturnPath } from "../../src/lib/auth/auth-actions.application";

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  home: vi.fn(),
  login: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/auth-access.supabase.server", () => ({
  getCurrentAuthAccess: mocks.access,
  acceptCurrentAuthConsent: vi.fn(),
}));
vi.mock("@/lib/account/account.supabase.server", () => ({
  currentRoleHome: mocks.home,
}));
vi.mock("@/lib/auth/supabase-auth.server", () => ({
  getAuthApplication: () => ({ login: mocks.login }),
}));
vi.mock("@/lib/i18n/locale", () => ({ resolveLocale }));
vi.mock("@/lib/auth/auth-actions.application", () => ({
  validatedInternalReturnPath,
}));
vi.mock("../../src/app/(auth)/_components/auth-form", () => ({
  AuthForm: () => null,
}));
vi.mock("../../src/app/(auth)/_components/auth-shell", () => ({
  AuthShell: () => null,
}));

import { loginAction } from "../../src/app/(auth)/actions";
import { AuthPage } from "../../src/app/(auth)/_components/auth-page";
import ConsentPage from "../../src/app/(auth)/consent/page";

const prior = { status: "SUCCESS", returnPath: "/learn" } as const;
const deepLink = "/learn/cohort/unit/chat?session=sample#exchange-example";
function form() {
  const data = new FormData();
  data.set("locale", "ar");
  data.set("role", "ADMIN"); // Untrusted input cannot choose the destination.
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.access.mockResolvedValue({ gate: "READY" });
  mocks.home.mockResolvedValue("/learn");
  mocks.login.mockResolvedValue(prior);
  mocks.redirect.mockImplementation((address: string) => {
    throw new Error(`redirect:${address}`);
  });
});

describe("authenticated entry adapters", () => {
  it.each(["/learn", "/batch-leader", "/admin"])(
    "routes default sign-in to verified role home %s, ignoring client role",
    async (home) => {
      mocks.home.mockResolvedValue(home);
      await expect(loginAction(prior, form())).rejects.toThrow(
        `redirect:${home}?lang=ar`,
      );
    },
  );
  it("preserves session and exchange context on an explicit safe return", async () => {
    mocks.login.mockResolvedValue({ ...prior, returnPath: deepLink });
    await expect(loginAction(prior, form())).rejects.toThrow(
      "redirect:/learn/cohort/unit/chat?session=sample&lang=ar#exchange-example",
    );
    expect(mocks.home).not.toHaveBeenCalled();
  });
  it.each(["CONSENT_REQUIRED", "VERIFY_EMAIL", "SUSPENDED", "DISABLED"])(
    "keeps the %s gate ahead of role routing",
    async (gate) => {
      mocks.access.mockResolvedValue({ gate });
      await expect(loginAction(prior, form())).rejects.toThrow("redirect:");
      expect(mocks.home).not.toHaveBeenCalled();
      const destination = mocks.redirect.mock.calls[0]![0] as string;
      expect(destination).toContain(
        gate === "CONSENT_REQUIRED"
          ? "/consent?"
          : gate === "VERIFY_EMAIL"
            ? "/verify-email?"
            : `/login?lang=ar&status=${gate.toLowerCase()}`,
      );
    },
  );
  it("returns bounded unavailable state when verified role lookup fails", async () => {
    mocks.home.mockRejectedValue(new Error("private database diagnostic"));
    await expect(loginAction(prior, form())).resolves.toEqual({
      status: "UNAVAILABLE",
      returnPath: "/learn",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
  it("routes an already authenticated identity page without another role choice", async () => {
    mocks.home.mockResolvedValue("/admin");
    await expect(
      AuthPage({
        mode: "login",
        searchParams: Promise.resolve({ lang: "en" }),
      }),
    ).rejects.toThrow("redirect:/admin?lang=en");
  });
  it("preserves exchange context from an already authenticated identity page", async () => {
    await expect(
      AuthPage({
        mode: "login",
        searchParams: Promise.resolve({ lang: "ar", next: deepLink }),
      }),
    ).rejects.toThrow(
      "redirect:/learn/cohort/unit/chat?session=sample&lang=ar#exchange-example",
    );
    expect(mocks.home).not.toHaveBeenCalled();
  });
  it("replaces a forged external identity-page return with verified role home", async () => {
    mocks.home.mockResolvedValue("/batch-leader");
    await expect(
      AuthPage({
        mode: "login",
        searchParams: Promise.resolve({ next: "https://attacker.invalid" }),
      }),
    ).rejects.toThrow("redirect:/batch-leader?lang=en");
  });
  it("preserves the exchange anchor when current consent is already satisfied", async () => {
    await expect(
      ConsentPage({
        searchParams: Promise.resolve({ lang: "ar", next: deepLink }),
      }),
    ).rejects.toThrow(
      "redirect:/learn/cohort/unit/chat?session=sample&lang=ar#exchange-example",
    );
    expect(mocks.home).not.toHaveBeenCalled();
  });
});
