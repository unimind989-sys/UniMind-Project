import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260924134026_audited_admin_actions.sql",
    import.meta.url,
  ),
  "utf8",
);

const serviceAdapter = readFileSync(
  new URL(
    "../../src/lib/admin/admin-actions.supabase.server.ts",
    import.meta.url,
  ),
  "utf8",
);

describe("audited admin action trust boundaries", () => {
  it("keeps founder identities and production approval records unseeded", () => {
    expect(migration).toMatch(
      /create table unimind_private\.founder_principals/u,
    );
    expect(migration).toMatch(
      /create table unimind_private\.admin_mock_artifact_approvals/u,
    );
    expect(migration).not.toMatch(
      /insert into unimind_private\.(founder_principals|admin_mock_artifact_approvals)/iu,
    );
  });

  it("exposes only server-role RPC execution and keeps implementation functions private", () => {
    expect(migration).toMatch(/security definer\s+set search_path = ''/iu);
    expect(migration).toMatch(
      /revoke all on function public\.submit_admin_governance_action\([\s\S]*?\)\s+from public, anon, authenticated;/iu,
    );
    expect(migration).toMatch(
      /grant execute on function public\.submit_admin_governance_action\([\s\S]*?\)\s+to service_role;/iu,
    );
    expect(migration).toMatch(
      /revoke all on function public\.current_admin_action_queue\([\s\S]*?\)\s+from public, anon, authenticated;/iu,
    );
    expect(migration).toMatch(
      /grant execute on function public\.current_admin_action_queue\([\s\S]*?\)\s+to service_role;/iu,
    );
    expect(migration).not.toMatch(
      /grant execute on function public\.(submit_admin_governance_action|current_admin_action_queue)[\s\S]*?to (anon|authenticated)/iu,
    );
  });

  it("rechecks target state and version under row locks before writes", () => {
    expect(
      migration.match(/for update(?: of [a-z_, ]+)?;/giu)?.length,
    ).toBeGreaterThanOrEqual(10);
    expect(migration).toMatch(
      /if p_expected_state <> v_current_state or p_expected_version <> v_version then[\s\S]*?ADMIN_ACTION:STALE_VERSION/iu,
    );
    expect(migration).toMatch(/governance_version = governance_version \+ 1/iu);
  });

  it("keeps retry as an audited request and readiness separate from current availability", () => {
    expect(migration).toMatch(/when 'RETRY_SOURCE' then\s+null;/u);
    expect(migration).toMatch(/'PENDING_OWNER_REVIEW'/u);
    expect(migration).toMatch(
      /check \(processing_status <> 'READY' or accepted_at is not null\)/u,
    );
    expect(serviceAdapter).toMatch(/requireVerifiedIdentity\(\)/u);
    expect(serviceAdapter).toMatch(/submitAdminGovernanceActionRpc\(/u);
  });

  it("returns scoped labels and predicate codes without raw keys or provider payloads", () => {
    expect(migration).toMatch(
      /target_label_en text,[\s\S]*?failed_predicates text\[\]/u,
    );
    expect(migration).toMatch(/raw\.object_key like 'synthetic\/%'/u);
    expect(migration).not.toMatch(
      /target_label_(?:en|ar)\s*,\s*raw\.object_key/u,
    );
    expect(serviceAdapter).toMatch(
      /adminActionResultSchema\.safeParse\(data\)/u,
    );
  });
});
