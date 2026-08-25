import { randomUUID } from "node:crypto";

import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

type StoredCookie = Readonly<{
  value: string;
  options: CookieOptions;
}>;

const cookieJar = vi.hoisted(() => new Map<string, StoredCookie>());

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll() {
      return [...cookieJar].map(([name, cookie]) => ({
        name,
        value: cookie.value,
      }));
    },
    set(name: string, value: string, options: CookieOptions) {
      cookieJar.set(name, { value, options });
    },
  }),
}));

const hostedDescribe =
  process.env.UNIMIND_HOSTED_AUTH_TEST === "true" ? describe : describe.skip;

hostedDescribe("hosted synthetic Supabase Auth", () => {
  let createdUserId: string | undefined;

  beforeEach(() => {
    cookieJar.clear();
  });

  afterAll(async () => {
    if (createdUserId !== undefined) {
      const { deleteSyntheticAuthUser } =
        await import("../../src/lib/db/supabase/admin");
      await deleteSyntheticAuthUser(createdUserId);
    }
  });

  it("signs in, refreshes, reaches the verified mutation guard, and denies a forged cookie", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url === undefined || publishableKey === undefined) {
      throw new Error("Hosted Auth public configuration is missing.");
    }

    const nonce = randomUUID();
    const email = `wp01-t05-${nonce}@auth-fixture.unimind.invalid`;
    const password = `Synthetic-A1!${nonce}`;
    const { createSyntheticAuthUser, SupabaseAdminOperationError } =
      await import("../../src/lib/db/supabase/admin");
    let created;
    try {
      created = await createSyntheticAuthUser({ email, password });
    } catch (error) {
      if (error instanceof SupabaseAdminOperationError) {
        const diagnosticCode = /^[a-z0-9_]{1,64}$/u.test(error.providerCode)
          ? error.providerCode
          : "unknown";
        const diagnosticStatus = error.providerStatus ?? "unknown";
        throw new Error(
          `Hosted synthetic Auth create-user failed with provider code/status: ${diagnosticCode}/${diagnosticStatus}.`,
        );
      }
      throw error;
    }
    createdUserId = created.userId;

    const browser = createBrowserClient(url, publishableKey, {
      isSingleton: false,
      cookies: {
        getAll() {
          return [...cookieJar].map(([name, cookie]) => ({
            name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieJar.set(name, { value, options });
          }
        },
      },
    });

    const signIn = await browser.auth.signInWithPassword({ email, password });
    expect(signIn.error).toBeNull();
    expect(signIn.data.user?.id).toBe(created.userId);
    expect(cookieJar.size).toBeGreaterThan(0);

    const { requireVerifiedIdentity, getVerifiedIdentity } =
      await import("../../src/lib/auth/verified-identity.server");
    await expect(requireVerifiedIdentity()).resolves.toEqual({
      userId: created.userId,
    });

    const refresh = await browser.auth.refreshSession();
    expect(refresh.error).toBeNull();
    await expect(requireVerifiedIdentity()).resolves.toEqual({
      userId: created.userId,
    });

    for (const [name, cookie] of cookieJar) {
      cookieJar.set(name, {
        ...cookie,
        value: `${cookie.value}forged`,
      });
    }
    await expect(getVerifiedIdentity()).resolves.toBeNull();
  });
});
