import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentStudentProfile,
  listCurrentStudentAvailableUnits,
} from "../../src/lib/db/supabase/student-access.server";
import { createFakeSupabase } from "../helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

function useStudentClient() {
  const fake = createFakeSupabase({
    tables: {
      profiles: {
        data: {
          display_name: "Synthetic Student",
          preferred_language: "EN",
          email: "private@example.invalid",
        },
        error: null,
      },
    },
    rpc: {
      available_curriculum_units: {
        data: [
          {
            id: "20000000-0000-0000-0000-000000000007",
            cohort_id: "20000000-0000-0000-0000-000000000006",
            code: "UNIT_A",
            unit_type: "MODULE",
            title_en: "Synthetic Unit A",
            title_ar: "وحدة تجريبية أ",
          },
        ],
        error: null,
      },
    },
  });
  mocks.createServerSupabaseClient.mockResolvedValue(fake.client);
  return fake;
}

let fake: ReturnType<typeof useStudentClient>;

beforeEach(() => {
  fake = useStudentClient();
});

describe("caller-scoped student Supabase access", () => {
  it("reads only the caller's safe profile projection", async () => {
    await expect(getCurrentStudentProfile()).resolves.toEqual({
      displayName: "Synthetic Student",
      preferredLanguage: "EN",
    });
    expect(fake.calls.tables).toEqual(["profiles"]);
    expect(fake.calls.rpc).toEqual([]);
  });

  it("runs catalog availability as the authenticated caller without admin preview", async () => {
    await expect(listCurrentStudentAvailableUnits()).resolves.toEqual([
      {
        id: "20000000-0000-0000-0000-000000000007",
        cohortId: "20000000-0000-0000-0000-000000000006",
        code: "UNIT_A",
        unitType: "MODULE",
        titleEn: "Synthetic Unit A",
        titleAr: "وحدة تجريبية أ",
      },
    ]);
    expect(fake.calls.rpc).toEqual([
      { name: "available_curriculum_units", args: { admin_preview: false } },
    ]);
  });
});
