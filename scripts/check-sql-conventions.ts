import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { auditMigrationSet, type SqlMigration } from "./lib/sql-conventions";

const migrationDirectory = path.resolve("supabase/migrations");
const files = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  throw new Error("No versioned SQL migrations were found.");
}

const migrations: SqlMigration[] = await Promise.all(
  files.map(async (file) => ({
    file,
    source: await readFile(path.join(migrationDirectory, file), "utf8"),
  })),
);
const violations = auditMigrationSet(migrations);

for (const { code, file, message } of violations) {
  console.error(
    `${path.join("supabase/migrations", file)}: ${code}: ${message}`,
  );
}
if (violations.length > 0) {
  throw new Error(
    `SQL convention audit found ${String(violations.length)} violation(s).`,
  );
}

console.log(
  `SQL convention audit passed for ${String(files.length)} migration(s).`,
);
