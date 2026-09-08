import { randomUUID } from "node:crypto";

import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type StoredCookie = Readonly<{
  value: string;
  options: CookieOptions;
}>;

const cookieJar = vi.hoisted(() => new Map<string, StoredCookie>());
const syntheticAdminId = "10000000-0000-0000-0000-000000000001";

function privilegedContext(reason: string) {
  return {
    actorUserId: syntheticAdminId,
    correlationId: randomUUID(),
    reason,
  };
}

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

const databaseDescribe =
  process.env.UNIMIND_DATABASE_AUTH_TEST === "true" ? describe : describe.skip;

databaseDescribe("synthetic Supabase Auth", () => {
  const createdUserIds = new Set<string>();

  beforeEach(() => {
    cookieJar.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    if (createdUserIds.size > 0) {
      const { deleteSyntheticAuthUser } =
        await import("../../src/lib/db/supabase/admin.server");
      for (const userId of createdUserIds) {
        await deleteSyntheticAuthUser(
          userId,
          privilegedContext("Disposable Auth integration cleanup"),
        );
      }
    }
  });

  it("signs in, refreshes, reaches the verified mutation guard, and denies a forged cookie", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url === undefined || publishableKey === undefined) {
      throw new Error("Database Auth public configuration is missing.");
    }

    const nonce = randomUUID();
    const email = `wp01-t05-${nonce}@auth-fixture.unimind.invalid`;
    const password = `Synthetic-A1!${nonce}`;
    const { createSyntheticAuthUser, SupabaseAdminOperationError } =
      await import("../../src/lib/db/supabase/admin.server");
    let created;
    try {
      created = await createSyntheticAuthUser(
        { email, password },
        privilegedContext("Create disposable Auth refresh fixture"),
      );
    } catch (error) {
      if (error instanceof SupabaseAdminOperationError) {
        const diagnosticCode = /^[a-z0-9_]{1,64}$/u.test(error.providerCode)
          ? error.providerCode
          : "unknown";
        const diagnosticStatus = error.providerStatus ?? "unknown";
        throw new Error(
          `Synthetic Auth create-user failed with provider code/status: ${diagnosticCode}/${diagnosticStatus}.`,
        );
      }
      throw error;
    }
    createdUserIds.add(created.userId);

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

    const expiresAt = signIn.data.session?.expires_at;
    if (expiresAt === undefined) {
      throw new Error("Auth session is missing its expiry timestamp.");
    }
    const originalCookieValues = new Map(
      [...cookieJar].map(([name, cookie]) => [name, cookie.value]),
    );
    const request = new NextRequest(
      "https://app.unimind.invalid/auth-refresh-proof",
      {
        headers: {
          cookie: [...cookieJar]
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join("; "),
        },
      },
    );

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date((expiresAt - 30) * 1_000));
    const { refreshSupabaseSession } =
      await import("../../src/lib/auth/refresh-session.server");
    const response = await refreshSupabaseSession(request);
    vi.useRealTimers();

    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.cookies.getAll().length).toBeGreaterThan(0);
    expect(
      request.cookies
        .getAll()
        .some(({ name, value }) => originalCookieValues.get(name) !== value),
    ).toBe(true);

    cookieJar.clear();
    for (const { name, value } of request.cookies.getAll()) {
      cookieJar.set(name, { value, options: {} });
    }
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

  it("uses caller-scoped RLS, denies Storage, and revokes deleted-user access", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url === undefined || publishableKey === undefined) {
      throw new Error("Database Auth public configuration is missing.");
    }

    const nonce = randomUUID();
    const email = `wp02-t08-${nonce}@auth-fixture.unimind.invalid`;
    const password = `Synthetic-A1!${nonce}`;
    const { createSyntheticAuthUser, deleteSyntheticAuthUser } =
      await import("../../src/lib/db/supabase/admin.server");
    const created = await createSyntheticAuthUser(
      { email, password },
      privilegedContext("Create WP02-T08 caller-scope fixture"),
    );
    createdUserIds.add(created.userId);

    const caller = createBrowserClient(url, publishableKey, {
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
    const signIn = await caller.auth.signInWithPassword({ email, password });
    expect(signIn.error).toBeNull();
    const session = signIn.data.session;
    if (session === null) {
      throw new Error("WP02-T08 Auth session is missing.");
    }
    expect(session.expires_in).toBeLessThanOrEqual(3_600);

    const { getCurrentStudentProfile, listCurrentStudentAvailableUnits } =
      await import("../../src/lib/db/supabase/student-access.server");
    await expect(getCurrentStudentProfile()).resolves.toEqual({
      displayName: "",
      preferredLanguage: "EN",
    });
    await expect(listCurrentStudentAvailableUnits()).resolves.toEqual([]);

    const crossUserProfiles = await caller
      .from("profiles")
      .select("user_id")
      .neq("user_id", created.userId);
    expect(crossUserProfiles.error).toBeNull();
    expect(crossUserProfiles.data).toEqual([]);

    const signedUpload = await caller.storage
      .from("unimind-raw")
      .createSignedUploadUrl(`synthetic/${nonce}.pdf`);
    expect(signedUpload.error).not.toBeNull();
    expect(signedUpload.data).toBeNull();

    const upsert = await caller.storage
      .from("unimind-raw")
      .upload(
        `synthetic/${nonce}.pdf`,
        new TextEncoder().encode("synthetic WP02-T08 bytes"),
        { contentType: "application/pdf", upsert: true },
      );
    expect(upsert.error).not.toBeNull();
    expect(upsert.data).toBeNull();

    await deleteSyntheticAuthUser(
      created.userId,
      privilegedContext("Delete WP02-T08 caller-scope fixture"),
    );
    createdUserIds.delete(created.userId);

    const issuedTokenClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    });
    const profileAfterDeletion = await issuedTokenClient
      .from("profiles")
      .select("user_id");
    expect(profileAfterDeletion.error).toBeNull();
    expect(profileAfterDeletion.data).toEqual([]);

    const refreshClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const refreshed = await refreshClient.auth.refreshSession({
      refresh_token: session.refresh_token,
    });
    expect(refreshed.error).not.toBeNull();
    expect(refreshed.data.session).toBeNull();
  });
});
