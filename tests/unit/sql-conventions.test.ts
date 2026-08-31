import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMigrationSet,
  type SqlMigration,
} from "../../scripts/lib/sql-conventions";

function migration(source: string, file = "20260831000000_safe_fixture.sql") {
  return { file, source } satisfies SqlMigration;
}

const safePrivateTable = `
create table unimind_private.job_attempts (
  attempt_key text primary key,
  outcome text not null,
  created_at timestamptz not null default now()
);
`;

describe("SQL migration conventions", () => {
  it("accepts the repository migration set", async () => {
    const directory = "supabase/migrations";
    const files = (await readdir(directory))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    const migrations = await Promise.all(
      files.map(async (file) => ({
        file,
        source: await readFile(path.join(directory, file), "utf8"),
      })),
    );

    expect(auditMigrationSet(migrations)).toEqual([]);
  });

  it("requires pinned-CLI filename shape and schema-qualified tables", () => {
    const violations = auditMigrationSet([
      migration(
        `create table unsafe (id text primary key, created_at timestamptz not null default now());`,
        "unsafe-name.sql",
      ),
    ]);

    expect(violations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "INVALID_MIGRATION_FILENAME",
        "UNQUALIFIED_TABLE",
      ]),
    );
  });

  it("requires created_at and UTC-aware timestamps", () => {
    const violations = auditMigrationSet([
      migration(`
        create table unimind_private.unsafe_time (
          id text primary key,
          observed_at timestamp not null
        );
      `),
    ]);

    expect(violations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "CREATED_AT_MISSING",
        "TIMESTAMP_WITHOUT_TIMEZONE",
      ]),
    );
  });

  it("requires UUID primary keys for public domain tables", () => {
    const violations = auditMigrationSet([
      migration(`
        create table public.curriculum_units (
          unit_id text primary key,
          created_at timestamptz not null default transaction_timestamp()
        );
      `),
    ]);

    expect(violations.map(({ code }) => code)).toContain(
      "PUBLIC_PRIMARY_KEY_NOT_UUID",
    );
  });

  it("accepts inline and composite UUID primary keys", () => {
    const violations = auditMigrationSet([
      migration(`
        create table public.cohorts (
          cohort_id uuid primary key default extensions.gen_random_uuid(),
          created_at timestamptz not null default now()
        );

        create table public.memberships (
          profile_id uuid not null,
          cohort_id uuid not null,
          created_at timestamptz not null default now(),
          primary key (profile_id, cohort_id)
        );
      `),
    ]);

    expect(violations).toEqual([]);
  });

  it("rejects legacy sequence aliases and broad grants", () => {
    const violations = auditMigrationSet([
      migration(`
        create table unimind_private.unsafe_events (
          event_id bigserial primary key,
          created_at timestamptz not null default now()
        );
        grant all on table unimind_private.unsafe_events to authenticated;
        grant select on table unimind_private.unsafe_events to public;
        alter default privileges grant select on tables to authenticated;
      `),
    ]);

    expect(violations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "LEGACY_SERIAL_TYPE",
        "GRANT_ALL_FORBIDDEN",
        "GRANT_TO_PUBLIC_FORBIDDEN",
        "DEFAULT_PRIVILEGE_GRANT_FORBIDDEN",
      ]),
    );
  });

  it("requires security-definer functions to be private and hardened", () => {
    const violations = auditMigrationSet([
      migration(`
        create function public.unsafe_actor()
        returns uuid
        language sql
        security definer
        as $$ select auth.uid(); $$;
      `),
    ]);

    expect(violations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "SECURITY_DEFINER_EXPOSED",
        "SECURITY_DEFINER_SEARCH_PATH_MISSING",
        "SECURITY_DEFINER_PUBLIC_EXECUTE_NOT_REVOKED",
      ]),
    );
  });

  it("accepts a hardened private security-definer function", () => {
    const violations = auditMigrationSet([
      migration(`
        create function unimind_private.actor_id()
        returns uuid
        language sql
        security definer
        set search_path = ''
        as $$ select auth.uid(); $$;

        revoke all on function unimind_private.actor_id() from public;
        grant execute on function unimind_private.actor_id() to authenticated;
      `),
    ]);

    expect(violations).toEqual([]);
  });

  it("rejects a privileged function that searches an exposed schema", () => {
    const violations = auditMigrationSet([
      migration(`
        create function unimind_private.unsafe_lookup()
        returns uuid
        language sql
        security definer
        -- set search_path = ''
        set search_path = public
        as $$ select auth.uid(); $$;

        revoke all on function unimind_private.unsafe_lookup() from public;
      `),
    ]);

    expect(violations.map(({ code }) => code)).toContain(
      "SECURITY_DEFINER_SEARCH_PATH_MISSING",
    );
  });

  it("ignores convention words inside comments and string bodies", () => {
    const violations = auditMigrationSet([
      migration(`
        -- timestamp grant all serial security definer
        ${safePrivateTable}
        comment on table unimind_private.job_attempts is
          'mentions timestamp, grant all, and serial as documentation';
      `),
    ]);

    expect(violations).toEqual([]);
  });
});
