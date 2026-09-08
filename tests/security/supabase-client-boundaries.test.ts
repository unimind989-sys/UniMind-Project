import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

async function listSourceFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)));
    } else if (/\.[cm]?[jt]sx?$/u.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

describe("WP02-T08 Supabase client architecture", () => {
  it("contains the raw service-role client in one narrow server-only module", async () => {
    const sourceFiles = [
      ...(await listSourceFiles(path.resolve("src"))),
      ...(await listSourceFiles(path.resolve("workers"))),
    ];
    const directProviderClients: string[] = [];
    const serviceCredentialConsumers: string[] = [];

    for (const file of sourceFiles) {
      const source = await readFile(file, "utf8");
      const relative = path.relative(process.cwd(), file).replaceAll("\\", "/");
      if (source.includes('from "@supabase/supabase-js"')) {
        directProviderClients.push(relative);
      }
      if (
        source.includes("SUPABASE_SERVICE_ROLE_KEY") &&
        !relative.endsWith("src/lib/config/env.schema.ts")
      ) {
        serviceCredentialConsumers.push(relative);
      }
    }

    expect(directProviderClients).toEqual([
      "src/lib/db/supabase/admin.server.ts",
    ]);
    expect(serviceCredentialConsumers).toEqual([
      "src/lib/db/supabase/admin.server.ts",
    ]);

    const adminSource = await readFile(
      "src/lib/db/supabase/admin.server.ts",
      "utf8",
    );
    expect(adminSource.startsWith('import "server-only";')).toBe(true);
    expect(adminSource).not.toMatch(
      /export\s+(?:async\s+)?function\s+createAdminClient/u,
    );
    expect(adminSource).toContain('rpc("record_privileged_auth_action"');
  });

  it("keeps student reads caller-scoped and unable to import privileged code", async () => {
    const studentSource = await readFile(
      "src/lib/db/supabase/student-access.server.ts",
      "utf8",
    );

    expect(studentSource.startsWith('import "server-only";')).toBe(true);
    expect(studentSource).toContain('from "./server"');
    expect(studentSource).not.toMatch(
      /from\s+["'][^"']*admin|service.?role|SUPABASE_SERVICE_ROLE_KEY/iu,
    );
    expect(studentSource).not.toMatch(/userId\s*:/u);
    expect(studentSource).toContain('rpc("available_curriculum_units"');
  });

  it("locks the session lifetime and refresh-revocation policy to versioned configuration", async () => {
    const config = await readFile("supabase/config.toml", "utf8");
    const policy = await readFile(
      "docs/policies/auth-session-revocation.md",
      "utf8",
    );

    expect(config).toMatch(/^jwt_expiry = 3600$/mu);
    expect(config).toMatch(/^enable_refresh_token_rotation = true$/mu);
    expect(config).toMatch(/^refresh_token_reuse_interval = 10$/mu);
    expect(policy).toContain(
      "no application path may treat signature validity alone as durable authorization",
    );
    expect(policy).toContain(
      "Signed-upload creation/finalization and upsert must fail closed",
    );
  });
});
