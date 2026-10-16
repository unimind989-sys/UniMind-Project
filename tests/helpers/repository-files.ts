import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach } from "vitest";

const migrationDirectory = path.resolve("supabase/migrations");

/** Reads every repository migration in filename (apply) order. */
export async function readMigrations(): Promise<
  Array<Readonly<{ file: string; source: string }>>
> {
  const files = (await readdir(migrationDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      source: await readFile(path.join(migrationDirectory, file), "utf8"),
    })),
  );
}

/**
 * Registers a fresh temporary directory for each test and removes it
 * afterwards. Call at module or describe scope; read `.path` inside tests.
 */
export function tempDirectoryPerTest(prefix: string) {
  const directory = { path: "" };
  beforeEach(async () => {
    directory.path = await mkdtemp(path.join(tmpdir(), prefix));
  });
  afterEach(async () => {
    await rm(directory.path, { recursive: true, force: true });
  });
  return directory;
}
