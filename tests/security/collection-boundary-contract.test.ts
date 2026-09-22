import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  "supabase/migrations/20260922143605_batch_leader_collection_flow.sql",
);

describe("Batch Leader collection trust boundary", () => {
  it("keeps upload evidence private and finalizes through caller-rechecked functions", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create table unimind_private.collection_uploads");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("assignments.expires_at > transaction_timestamp()");
    expect(sql).toContain("campaigns.status = 'OPEN'");
    expect(sql).toContain("p_declared_rights <> 'DECLARED'");
    expect(sql).toContain("for update");
    expect(sql).not.toContain("cohorts_select_assigned_collection");
    expect(sql).not.toContain("curriculum_units_select_assigned_collection");
    expect(sql).toMatch(
      /create function unimind_private\.current_batch_leader_campaign_internal[\s\S]+?language sql\s+stable\s+security definer\s+set search_path/iu,
    );
    expect(sql).toMatch(
      /create function public\.current_batch_leader_campaign[\s\S]+?language sql\s+stable\s+security invoker\s+set search_path/iu,
    );
    expect(sql).toContain("security invoker");
  });

  it("keeps registration server-only and exposes only bounded finalization to callers", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain(
      "revoke all on table unimind_private.collection_uploads",
    );
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain(
      "drop policy source_submissions_insert_assigned on public.source_submissions",
    );
    expect(sql).toContain(
      "revoke insert on table public.source_submissions from authenticated",
    );
    expect(sql).toContain("language sql\nsecurity invoker");
    expect(sql).toMatch(
      /grant execute on function public\.register_synthetic_collection_upload\([^;]+\)\s+to service_role;/iu,
    );
    expect(sql).not.toMatch(
      /grant execute on function public\.register_synthetic_collection_upload\([^;]+\)\s+to authenticated;/iu,
    );
    expect(sql).toMatch(
      /grant execute on function public\.finalize_synthetic_source_submission[\s\S]+to authenticated/iu,
    );
    expect(sql).not.toContain(
      "grant select on table unimind_private.collection_uploads",
    );
    expect(sql).not.toContain(
      "grant usage on schema unimind_private to authenticated",
    );
  });
});
