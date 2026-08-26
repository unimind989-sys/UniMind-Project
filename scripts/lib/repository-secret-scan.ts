import { readFile } from "node:fs/promises";
import path from "node:path";

export type RepositorySecretViolation = Readonly<{
  path: string;
  line: number;
  code: string;
}>;

const detectors = [
  {
    code: "SUPABASE_SECRET_KEY",
    pattern: new RegExp(["sb", "secret", "[A-Za-z0-9_-]{20,}"].join("_"), "u"),
  },
  {
    code: "SUPABASE_ACCESS_TOKEN",
    pattern: new RegExp(["sbp", "[A-Za-z0-9]{20,}"].join("_"), "u"),
  },
  {
    code: "GITHUB_TOKEN",
    pattern: new RegExp(
      `(?:${["ghp", "[A-Za-z0-9]{30,}"].join("_")}|${["github", "pat", "[A-Za-z0-9_]{30,}"].join("_")})`,
      "u",
    ),
  },
  {
    code: "PROVIDER_API_KEY",
    pattern: new RegExp(["sk", "[A-Za-z0-9_-]{24,}"].join("-"), "u"),
  },
  {
    code: "PRIVATE_KEY",
    pattern: new RegExp(
      ["-----BEGIN", "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----"].join(" "),
      "u",
    ),
  },
] as const;

const safeFixtureMarkers = [
  "synthetic",
  ".invalid",
  "<token>",
  "example",
  "deleted",
] as const;

function isSafeFixtureLine(line: string): boolean {
  const normalized = line.toLowerCase();
  return safeFixtureMarkers.some((marker) => normalized.includes(marker));
}

function containsPrivateDatabaseUrl(line: string): boolean {
  if (isSafeFixtureLine(line)) {
    return false;
  }
  return /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^\s/]+/u.test(line);
}

export async function scanFilesForRepositorySecrets(
  workspace: string,
  files: readonly string[],
): Promise<RepositorySecretViolation[]> {
  const violations: RepositorySecretViolation[] = [];
  for (const relativePath of files) {
    const absolutePath = path.resolve(workspace, relativePath);
    const contents = await readFile(absolutePath);
    if (contents.includes(0)) {
      continue;
    }
    const lines = contents.toString("utf8").split(/\r?\n/u);
    lines.forEach((line, index) => {
      if (!isSafeFixtureLine(line)) {
        for (const detector of detectors) {
          if (detector.pattern.test(line)) {
            violations.push({
              path: relativePath.replaceAll("\\", "/"),
              line: index + 1,
              code: detector.code,
            });
          }
        }
      }
      if (containsPrivateDatabaseUrl(line)) {
        violations.push({
          path: relativePath.replaceAll("\\", "/"),
          line: index + 1,
          code: "DATABASE_CREDENTIAL",
        });
      }
    });
  }
  return violations;
}
