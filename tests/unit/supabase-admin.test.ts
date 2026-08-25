import { beforeEach, describe, expect, it, vi } from "vitest";

const syntheticServiceRoleKey = "synthetic-service-role-key";
const syntheticUserId = "5f6b38b2-1040-4bce-8d65-4db44d755b0c";
const syntheticEmail = "wp01-t05@auth-fixture.unimind.invalid";
const syntheticPassword = "Synthetic-auth-password-123";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createUser: vi.fn(),
  getUserById: vi.fn(),
  deleteUser: vi.fn(),
  getServerEnvironment: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));
vi.mock("../../src/lib/config/env.server", () => ({
  getServerEnvironment: mocks.getServerEnvironment,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getServerEnvironment.mockReturnValue({
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
    SUPABASE_SERVICE_ROLE_KEY: syntheticServiceRoleKey,
  });
  mocks.createClient.mockReturnValue({
    auth: {
      admin: {
        createUser: mocks.createUser,
        getUserById: mocks.getUserById,
        deleteUser: mocks.deleteUser,
      },
    },
  });
  mocks.createUser.mockResolvedValue({
    data: {
      user: {
        id: syntheticUserId,
      },
    },
    error: null,
  });
  mocks.getUserById.mockResolvedValue({
    data: {
      user: {
        id: syntheticUserId,
        email: syntheticEmail,
        app_metadata: {
          unimind_fixture: "wp01-t05-synthetic-auth",
        },
      },
    },
    error: null,
  });
  mocks.deleteUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  });
});

describe("narrow Supabase admin operations", () => {
  it("creates only marked synthetic users with a non-persistent admin client", async () => {
    const { createSyntheticAuthUser } =
      await import("../../src/lib/db/supabase/admin");

    await expect(
      createSyntheticAuthUser({
        email: syntheticEmail,
        password: syntheticPassword,
      }),
    ).resolves.toEqual({
      userId: syntheticUserId,
      email: syntheticEmail,
    });

    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://synthetic.supabase.invalid",
      syntheticServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
    expect(mocks.createUser).toHaveBeenCalledWith({
      email: syntheticEmail,
      password: syntheticPassword,
      email_confirm: true,
      app_metadata: {
        unimind_fixture: "wp01-t05-synthetic-auth",
      },
      user_metadata: {
        synthetic_fixture: true,
      },
    });
  });

  it("rejects a real-looking email before invoking Supabase", async () => {
    const { createSyntheticAuthUser, InvalidSyntheticAuthUserError } =
      await import("../../src/lib/db/supabase/admin");

    await expect(
      createSyntheticAuthUser({
        email: "student@example.com",
        password: syntheticPassword,
      }),
    ).rejects.toBeInstanceOf(InvalidSyntheticAuthUserError);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("deletes only users carrying both synthetic markers", async () => {
    const { deleteSyntheticAuthUser } =
      await import("../../src/lib/db/supabase/admin");

    await expect(
      deleteSyntheticAuthUser(syntheticUserId),
    ).resolves.toBeUndefined();
    expect(mocks.getUserById).toHaveBeenCalledWith(syntheticUserId);
    expect(mocks.deleteUser).toHaveBeenCalledWith(syntheticUserId);
  });

  it("refuses deletion when protected app metadata is missing", async () => {
    mocks.getUserById.mockResolvedValue({
      data: {
        user: {
          id: syntheticUserId,
          email: syntheticEmail,
          app_metadata: {},
        },
      },
      error: null,
    });

    const { deleteSyntheticAuthUser, UnsafeSyntheticAuthDeletionError } =
      await import("../../src/lib/db/supabase/admin");

    await expect(
      deleteSyntheticAuthUser(syntheticUserId),
    ).rejects.toBeInstanceOf(UnsafeSyntheticAuthDeletionError);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
  it("retains only a bounded provider HTTP status for diagnostics", async () => {
    mocks.createUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        status: 401,
      },
    });

    const { createSyntheticAuthUser, SupabaseAdminOperationError } =
      await import("../../src/lib/db/supabase/admin");

    await expect(
      createSyntheticAuthUser({
        email: syntheticEmail,
        password: syntheticPassword,
      }),
    ).rejects.toMatchObject({
      name: SupabaseAdminOperationError.name,
      operation: "create-user",
      providerCode: "unknown",
      providerStatus: 401,
    });
  });
});
