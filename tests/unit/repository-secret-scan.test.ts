import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { scanFilesForRepositorySecrets } from "../../scripts/lib/repository-secret-scan";

describe("repository secret scan", () => {
  it("reports a credential rule without copying the matched value", async () => {
    const workspace = await mkdtemp(
      path.join(tmpdir(), "unimind-secret-scan-"),
    );
    await mkdir(path.join(workspace, "src"));
    const secret = ["sb", "secret", "actualcredentialmaterial123456"].join("_");
    await writeFile(
      path.join(workspace, "src", "unsafe.ts"),
      `export const leaked = "${secret}"; // synthetic example label must not suppress detection\n`,
      "utf8",
    );

    const violations = await scanFilesForRepositorySecrets(workspace, [
      "src/unsafe.ts",
    ]);

    expect(violations).toEqual([
      { path: "src/unsafe.ts", line: 1, code: "SUPABASE_SECRET_KEY" },
    ]);
    expect(JSON.stringify(violations)).not.toContain(secret);
  });

  it("allows explicit synthetic and invalid-domain fixtures", async () => {
    const workspace = await mkdtemp(
      path.join(tmpdir(), "unimind-secret-scan-"),
    );
    await writeFile(
      path.join(workspace, "safe.txt"),
      [
        "SUPABASE_SERVICE_ROLE_KEY=synthetic-server-credential-only",
        "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/test",
      ].join("\n"),
      "utf8",
    );

    await expect(
      scanFilesForRepositorySecrets(workspace, ["safe.txt"]),
    ).resolves.toEqual([]);
  });

  it("does not let prose labels suppress a database credential", async () => {
    const workspace = await mkdtemp(
      path.join(tmpdir(), "unimind-secret-scan-"),
    );
    const credential = [
      "postgresql",
      "//synthetic",
      "synthetic@db.live-host.test:5432/app",
    ].join(":");
    await writeFile(
      path.join(workspace, "unsafe.txt"),
      `${credential} # example connection\n`,
      "utf8",
    );

    await expect(
      scanFilesForRepositorySecrets(workspace, ["unsafe.txt"]),
    ).resolves.toEqual([
      { path: "unsafe.txt", line: 1, code: "DATABASE_CREDENTIAL" },
    ]);
  });
});
