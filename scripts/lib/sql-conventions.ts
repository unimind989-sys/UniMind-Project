export type SqlConventionCode =
  | "CREATED_AT_MISSING"
  | "DEFAULT_PRIVILEGE_GRANT_FORBIDDEN"
  | "GRANT_ALL_FORBIDDEN"
  | "GRANT_TO_PUBLIC_FORBIDDEN"
  | "INVALID_MIGRATION_FILENAME"
  | "LEGACY_SERIAL_TYPE"
  | "PUBLIC_PRIMARY_KEY_NOT_UUID"
  | "SECURITY_DEFINER_EXPOSED"
  | "SECURITY_DEFINER_PUBLIC_EXECUTE_NOT_REVOKED"
  | "SECURITY_DEFINER_SEARCH_PATH_MISSING"
  | "TIMESTAMP_WITHOUT_TIMEZONE"
  | "UNQUALIFIED_TABLE";

export interface SqlMigration {
  file: string;
  source: string;
}

export interface SqlConventionViolation {
  code: SqlConventionCode;
  file: string;
  message: string;
}

interface CreatedTable {
  body: string;
  schema: string | undefined;
  table: string;
}

interface SqlStatement {
  masked: string;
  raw: string;
}

const migrationFilename = /^\d{14}_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$/u;

function violation(
  file: string,
  code: SqlConventionCode,
  message: string,
): SqlConventionViolation {
  return { code, file, message };
}

function replaceWithWhitespace(value: string): string {
  return value.replace(/[^\r\n]/gu, " ");
}

// Mask comments and literal bodies while retaining statement structure and offsets.
function maskSql(source: string): string {
  let result = "";
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("--", index)) {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      result += replaceWithWhitespace(source.slice(index, stop));
      index = stop;
      continue;
    }

    if (source.startsWith("/*", index)) {
      const start = index;
      let depth = 1;
      index += 2;
      while (index < source.length && depth > 0) {
        if (source.startsWith("/*", index)) {
          depth += 1;
          index += 2;
        } else if (source.startsWith("*/", index)) {
          depth -= 1;
          index += 2;
        } else {
          index += 1;
        }
      }
      result += replaceWithWhitespace(source.slice(start, index));
      continue;
    }

    if (source[index] === "'") {
      const start = index;
      index += 1;
      while (index < source.length) {
        if (source[index] === "'" && source[index + 1] === "'") {
          index += 2;
        } else if (source[index] === "'") {
          index += 1;
          break;
        } else {
          index += 1;
        }
      }
      result += replaceWithWhitespace(source.slice(start, index));
      continue;
    }

    if (source[index] === "$") {
      const delimiter = source
        .slice(index)
        .match(/^\$(?:[a-z_][a-z0-9_]*)?\$/iu)?.[0];
      if (delimiter !== undefined) {
        const start = index;
        const closing = source.indexOf(delimiter, index + delimiter.length);
        index = closing === -1 ? source.length : closing + delimiter.length;
        result += replaceWithWhitespace(source.slice(start, index));
        continue;
      }
    }

    result += source[index];
    index += 1;
  }

  return result;
}

function findClosingParenthesis(source: string, opening: number): number {
  let depth = 0;
  for (let index = opening; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    if (source[index] === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return source.length;
}

function extractCreatedTables(source: string): CreatedTable[] {
  const tables: CreatedTable[] = [];
  const pattern =
    /\bcreate\s+(?:unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_$]*)(?:\s*\.\s*([a-z_][a-z0-9_$]*))?\s*\(/giu;

  for (const match of source.matchAll(pattern)) {
    const opening = (match.index ?? 0) + match[0].lastIndexOf("(");
    const closing = findClosingParenthesis(source, opening);
    tables.push({
      body: source.slice(opening + 1, closing),
      schema: match[2] === undefined ? undefined : match[1]?.toLowerCase(),
      table: (match[2] ?? match[1] ?? "unknown").toLowerCase(),
    });
  }

  return tables;
}

function splitTopLevelComma(source: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    if (source[index] === ")") depth -= 1;
    if (source[index] === "," && depth === 0) {
      parts.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(source.slice(start).trim());
  return parts.filter((part) => part.length > 0);
}

function hasUuidPrimaryKey(table: CreatedTable): boolean {
  const parts = splitTopLevelComma(table.body);
  const uuidColumns = new Set<string>();

  for (const part of parts) {
    const column = part.match(/^([a-z_][a-z0-9_$]*)\s+uuid\b/iu)?.[1];
    if (column !== undefined) {
      uuidColumns.add(column.toLowerCase());
      if (/\bprimary\s+key\b/iu.test(part)) return true;
    }
  }

  for (const part of parts) {
    const primaryKey = part.match(
      /^(?:constraint\s+[a-z_][a-z0-9_$]*\s+)?primary\s+key\s*\(([^)]+)\)/iu,
    )?.[1];
    if (primaryKey === undefined) continue;
    const columns = primaryKey
      .split(",")
      .map((column) => column.trim().toLowerCase());
    if (
      columns.length > 0 &&
      columns.every((column) => uuidColumns.has(column))
    ) {
      return true;
    }
  }

  return false;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function splitSqlStatements(masked: string, raw: string): SqlStatement[] {
  const statements: SqlStatement[] = [];
  let start = 0;
  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== ";") continue;
    statements.push({
      masked: masked.slice(start, index),
      raw: raw.slice(start, index),
    });
    start = index + 1;
  }
  if (start < masked.length) {
    statements.push({ masked: masked.slice(start), raw: raw.slice(start) });
  }
  return statements;
}

function auditSecurityDefiners(
  file: string,
  maskedSource: string,
  rawSource: string,
): SqlConventionViolation[] {
  const violations: SqlConventionViolation[] = [];
  const statements = splitSqlStatements(maskedSource, rawSource);

  for (const statement of statements) {
    if (!/\bsecurity\s+definer\b/iu.test(statement.masked)) continue;
    const functionName = statement.masked.match(
      /\bcreate\s+(?:or\s+replace\s+)?function\s+([a-z_][a-z0-9_$]*)(?:\s*\.\s*([a-z_][a-z0-9_$]*))?\s*\(/iu,
    );
    if (functionName === null) continue;

    const schema = functionName[2] === undefined ? undefined : functionName[1];
    const name = functionName[2] ?? functionName[1];
    if (name === undefined) continue;
    const qualifiedName = schema === undefined ? name : `${schema}.${name}`;

    if (schema?.toLowerCase() !== "unimind_private") {
      violations.push(
        violation(
          file,
          "SECURITY_DEFINER_EXPOSED",
          `Security-definer function ${qualifiedName} must live in unimind_private.`,
        ),
      );
    }
    const searchPathClause = /\bset\s+search_path\s*(?:=|\bto\b)/iu.exec(
      statement.masked,
    );
    const rawSearchPathClause =
      searchPathClause === null
        ? ""
        : statement.raw.slice(searchPathClause.index);
    const hasEmptySearchPath = /^set\s+search_path\s*(?:=|\bto\b)\s*''/iu.test(
      rawSearchPathClause,
    );
    if (!hasEmptySearchPath) {
      violations.push(
        violation(
          file,
          "SECURITY_DEFINER_SEARCH_PATH_MISSING",
          `Security-definer function ${qualifiedName} must set an empty search_path and schema-qualify its references.`,
        ),
      );
    }

    const revokePattern = new RegExp(
      `\\brevoke\\s+all(?:\\s+privileges)?\\s+on\\s+function\\s+${escapeRegExp(qualifiedName)}\\s*\\(`,
      "iu",
    );
    if (!revokePattern.test(maskedSource)) {
      violations.push(
        violation(
          file,
          "SECURITY_DEFINER_PUBLIC_EXECUTE_NOT_REVOKED",
          `Security-definer function ${qualifiedName} must revoke PUBLIC execution.`,
        ),
      );
    }
  }

  return violations;
}

function auditMigration(migration: SqlMigration): SqlConventionViolation[] {
  const { file } = migration;
  const source = maskSql(migration.source);
  const violations: SqlConventionViolation[] = [];

  if (!migrationFilename.test(file)) {
    violations.push(
      violation(
        file,
        "INVALID_MIGRATION_FILENAME",
        "Use a 14-digit timestamp and lowercase snake-case description generated by the pinned Supabase CLI.",
      ),
    );
  }

  if (/\b(?:smallserial|serial|bigserial)\b/iu.test(source)) {
    violations.push(
      violation(
        file,
        "LEGACY_SERIAL_TYPE",
        "Use UUIDs for domain entities or a justified generated identity for internal append-only rows.",
      ),
    );
  }
  if (
    /\btimestamp(?:\s*\(\s*\d+\s*\))?(?!\s+with\s+time\s+zone)\b/iu.test(source)
  ) {
    violations.push(
      violation(
        file,
        "TIMESTAMP_WITHOUT_TIMEZONE",
        "Store instants with timestamptz (timestamp with time zone).",
      ),
    );
  }
  if (/\bgrant\s+all(?:\s+privileges)?\b/iu.test(source)) {
    violations.push(
      violation(
        file,
        "GRANT_ALL_FORBIDDEN",
        "Grant only the exact object privileges required by an intended role.",
      ),
    );
  }
  if (/\bgrant\b[^;]*\bto\s+public\b/iu.test(source)) {
    violations.push(
      violation(
        file,
        "GRANT_TO_PUBLIC_FORBIDDEN",
        "Do not grant database capabilities to PUBLIC.",
      ),
    );
  }
  if (/\balter\s+default\s+privileges\b[^;]*\bgrant\b/iu.test(source)) {
    violations.push(
      violation(
        file,
        "DEFAULT_PRIVILEGE_GRANT_FORBIDDEN",
        "Keep default privileges revoked and grant capabilities explicitly per object.",
      ),
    );
  }

  for (const table of extractCreatedTables(source)) {
    const qualifiedName =
      table.schema === undefined
        ? table.table
        : `${table.schema}.${table.table}`;
    if (table.schema === undefined) {
      violations.push(
        violation(
          file,
          "UNQUALIFIED_TABLE",
          `Table ${table.table} must be schema-qualified.`,
        ),
      );
    }
    if (
      !/\bcreated_at\s+timestamptz\s+not\s+null\s+default\s+(?:now|transaction_timestamp)\s*\(\s*\)/iu.test(
        table.body,
      )
    ) {
      violations.push(
        violation(
          file,
          "CREATED_AT_MISSING",
          `Table ${qualifiedName} must define created_at as a required UTC instant with a transaction-time default.`,
        ),
      );
    }
    if (table.schema === "public" && !hasUuidPrimaryKey(table)) {
      violations.push(
        violation(
          file,
          "PUBLIC_PRIMARY_KEY_NOT_UUID",
          `Public table ${qualifiedName} must use a UUID primary key.`,
        ),
      );
    }
  }

  violations.push(...auditSecurityDefiners(file, source, migration.source));
  return violations;
}

export function auditMigrationSet(
  migrations: readonly SqlMigration[],
): SqlConventionViolation[] {
  return migrations.flatMap(auditMigration);
}
