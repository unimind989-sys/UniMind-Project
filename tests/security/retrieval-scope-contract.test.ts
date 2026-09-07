import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const retrievalMigrationPath =
  "supabase/migrations/20260907124502_harden_server_only_retrieval_scope.sql";
const releaseRepairMigrationPath =
  "supabase/migrations/20260907123954_restrict_student_release_metadata.sql";

function normalizeSql(source: string): string {
  return source.replaceAll(/\s+/gu, " ").trim().toLowerCase();
}

describe("WP02-T06 server-only retrieval scope contract", () => {
  it("keeps vectors private and grants only the narrow function to service_role", async () => {
    const migration = normalizeSql(
      await readFile(retrievalMigrationPath, "utf8"),
    );

    expect(migration).not.toMatch(
      /grant select on (table )?unimind_private\.(source_segments|segment_embeddings) to authenticated/u,
    );
    expect(migration).toContain(
      "revoke all on function unimind_private.retrieve_authorized_segments( uuid, uuid, uuid, uuid, extensions.vector, text, integer ) from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function unimind_private.retrieve_authorized_segments( uuid, uuid, uuid, uuid, extensions.vector, text, integer ) to service_role",
    );
  });

  it("recomputes authorization and source state before candidate limits", async () => {
    const migration = normalizeSql(
      await readFile(retrievalMigrationPath, "utf8"),
    );
    const authorizationOffset = migration.indexOf(
      "if not unimind_private.can_user_access_unit(",
    );
    const vectorLimitOffset = migration.indexOf("limit candidate_limit");

    expect(authorizationOffset).toBeGreaterThan(-1);
    expect(vectorLimitOffset).toBeGreaterThan(authorizationOffset);
    for (const predicate of [
      "segments.cohort_id = target_cohort_id",
      "segments.curriculum_unit_id = target_curriculum_unit_id",
      "units.publication_status = 'published'",
      "releases.release_status = 'unlocked'",
      "versions.processing_status = 'ready'",
      "versions.activation_status = 'active'",
      "versions.rights_status = 'valid'",
      "versions.curriculum_edition = cohorts.curriculum_edition",
      "segments.curriculum_edition = cohorts.curriculum_edition",
    ]) {
      const predicateOffset = migration.indexOf(predicate, authorizationOffset);
      expect(predicateOffset).toBeGreaterThan(authorizationOffset);
      expect(predicateOffset).toBeLessThan(vectorLimitOffset);
    }
  });

  it("matches the synthetic HNSW operator class to a direct distance order", async () => {
    const migration = normalizeSql(
      await readFile(retrievalMigrationPath, "utf8"),
    );

    expect(migration).toContain(
      "using hnsw ( (embedding::extensions.vector(3)) extensions.vector_cosine_ops ) where embedding_config_id = '70000000-0000-0000-0000-000000000001'",
    );
    expect(migration).toContain("operator(extensions.<=>)");
    expect(migration).not.toContain("case config.distance_operator");
    expect(migration).toContain("websearch_to_tsquery('simple', query_text)");
    expect(migration).toContain("using gin (to_tsvector('simple', content))");
  });

  it("hides locked releases and gates direct unit metadata by full availability", async () => {
    const migration = normalizeSql(
      await readFile(releaseRepairMigrationPath, "utf8"),
    );

    expect(migration).toContain(
      "cohort_releases.release_status = 'unlocked' and public.has_active_membership(cohort_releases.cohort_id)",
    );
    expect(migration).toContain(
      "or public.can_access_unit(curriculum_units.id)",
    );
    expect(migration).toContain(
      "from public.source_assets as assets where assets.curriculum_unit_id = target_curriculum_unit_id",
    );
    expect(migration).not.toContain(
      "and unimind_private.can_read_source_asset(assets.id)",
    );
  });
});
