import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const actors = [
  "anon",
  "student",
  "batch_leader",
  "admin",
  "worker",
  "service_role",
] as const;
const tableActions = ["READ", "CREATE", "UPDATE", "DELETE"] as const;

interface MatrixRow {
  action: string;
  actor_role: string;
  automated_test: string;
  expected: string;
  notes: string;
  policy_or_function: string;
  resource: string;
  test_id: string;
  [column: string]: string;
}

function parseCsv(source: string): MatrixRow[] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      record.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      record.push(field);
      field = "";
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
    } else {
      field += character;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const [header, ...rows] = records;
  if (header === undefined) throw new Error("RLS matrix is empty.");
  return rows.map(
    (values) =>
      Object.fromEntries(
        header.map((column, index) => [column, values[index] ?? ""]),
      ) as MatrixRow,
  );
}

function resourcesFromMigrations(source: string) {
  const tables = new Set<string>();
  const functions = new Set<string>();
  for (const match of source.matchAll(
    /\bcreate\s+table\s+((?:public|unimind_private)\.[a-z0-9_]+)/giu,
  )) {
    if (match[1] !== undefined) tables.add(match[1].toLowerCase());
  }
  for (const match of source.matchAll(
    /\bcreate\s+(?:or\s+replace\s+)?function\s+((?:public|unimind_private)\.[a-z0-9_]+)\s*\(/giu,
  )) {
    if (match[1] !== undefined) functions.add(match[1].toLowerCase());
  }
  return { functions, tables };
}

function authenticatedTableGrants(source: string) {
  const result = new Set<string>();
  const normalized = source.replace(/\s+/gu, " ");
  for (const match of normalized.matchAll(
    /\bgrant\s+(.+?)\s+on\s+table\s+(public\.[a-z0-9_]+)\s+to\s+authenticated\s*;/giu,
  )) {
    const privileges = match[1]?.toUpperCase() ?? "";
    const resource = match[2]?.toLowerCase();
    if (resource === undefined) continue;
    for (const [privilege, action] of [
      ["SELECT", "READ"],
      ["INSERT", "CREATE"],
      ["UPDATE", "UPDATE"],
      ["DELETE", "DELETE"],
    ] as const) {
      if (new RegExp(`\\b${privilege}\\b`, "u").test(privileges)) {
        result.add(`${resource}|${action}`);
      }
    }
  }
  return result;
}

function authenticatedPolicies(source: string) {
  const result = new Set<string>();
  const normalized = source.replace(/\s+/gu, " ");
  for (const match of normalized.matchAll(
    /\bcreate\s+policy\s+[a-z0-9_]+\s+on\s+(public\.[a-z0-9_]+)\s+for\s+(select|insert|update|delete)\s+to\s+authenticated\b/giu,
  )) {
    const resource = match[1]?.toLowerCase();
    const command = match[2]?.toUpperCase();
    if (resource === undefined || command === undefined) continue;
    const action =
      command === "SELECT" ? "READ" : command === "INSERT" ? "CREATE" : command;
    result.add(`${resource}|${action}`);
  }
  return result;
}

describe("WP02-T04 actor/action/resource matrix contract", () => {
  it("covers the exact migration resource cross-product with reviewed decisions", async () => {
    const migrationDirectory = path.resolve("supabase/migrations");
    const migrationFiles = (await readdir(migrationDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    const migrationSource = (
      await Promise.all(
        migrationFiles.map((file) =>
          readFile(path.join(migrationDirectory, file), "utf8"),
        ),
      )
    ).join("\n");
    const matrix = parseCsv(
      await readFile("docs/security/rls-matrix.csv", "utf8"),
    );
    const databaseTests = await readFile(
      "supabase/tests/17_actor_action_resource_matrix.sql",
      "utf8",
    );
    const { functions, tables } = resourcesFromMigrations(migrationSource);
    const expectedKeys = new Set<string>();

    for (const resource of tables) {
      for (const actor of actors) {
        for (const action of tableActions) {
          expectedKeys.add(`${actor}|${resource}|${action}`);
        }
      }
    }
    for (const resource of functions) {
      for (const actor of actors) {
        expectedKeys.add(`${actor}|${resource}|EXECUTE`);
      }
    }

    const actualKeys = matrix.map(
      ({ action, actor_role: actor, resource }) =>
        `${actor}|${resource}|${action}`,
    );
    expect(tables.size).toBe(55);
    expect(functions.size).toBe(25);
    expect(matrix).toHaveLength(1_470);
    expect(new Set(actualKeys).size).toBe(matrix.length);
    expect(new Set(actualKeys)).toEqual(expectedKeys);

    for (const row of matrix) {
      expect(actors).toContain(row.actor_role);
      expect(["ALLOW", "DENY", "SERVER_ONLY"]).toContain(row.expected);
      expect(row.policy_or_function.trim()).not.toBe("");
      expect(row.test_id).toMatch(/^RLS-T04-[A-Z-]+$/u);
      expect(row.automated_test).toContain(
        "supabase/tests/17_actor_action_resource_matrix.sql#",
      );
      expect(databaseTests).toContain(row.test_id);
      expect(row.notes).not.toMatch(
        /auth[.]role|auth[.]jwt|app_metadata|user_metadata/iu,
      );
      expect(row.policy_or_function).not.toMatch(
        /auth[.]role|auth[.]jwt|app_metadata|user_metadata/iu,
      );
    }
  });

  it("agrees with grants and keeps every client out of private resources", async () => {
    const migrationDirectory = path.resolve("supabase/migrations");
    const migrationSource = (
      await Promise.all(
        (await readdir(migrationDirectory))
          .filter((file) => file.endsWith(".sql"))
          .map((file) => readFile(path.join(migrationDirectory, file), "utf8")),
      )
    ).join("\n");
    const matrix = parseCsv(
      await readFile("docs/security/rls-matrix.csv", "utf8"),
    );
    const grants = authenticatedTableGrants(migrationSource);
    const policies = authenticatedPolicies(migrationSource);

    for (const row of matrix) {
      const key = `${row.resource}|${row.action}`;
      if (row.actor_role === "anon") expect(row.expected).toBe("DENY");
      if (["worker", "service_role"].includes(row.actor_role)) {
        expect(row.expected).toBe("SERVER_ONLY");
      }
      if (
        row.resource.startsWith("unimind_private.") &&
        ["anon", "student", "batch_leader", "admin"].includes(row.actor_role)
      ) {
        expect(row.expected).toBe("DENY");
      }
      if (
        row.expected === "ALLOW" &&
        row.action !== "EXECUTE" &&
        ["student", "batch_leader", "admin"].includes(row.actor_role)
      ) {
        expect(grants).toContain(key);
        expect(policies).toContain(key);
      }
    }

    expect(migrationSource).not.toMatch(/grant\s+[^;]+\s+to\s+anon\s*;/iu);
  });
});
