import { readFileSync } from "node:fs";
import path from "node:path";

import type { HostedDatabaseEnvironment } from "./hosted-supabase-target";

const requiredProfileKeys = [
  "UNIMIND_DB_ENVIRONMENT",
  "UNIMIND_SUPABASE_PROJECT_REF",
  "UNIMIND_DB_RESET_CONFIRMATION",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
] as const;

type HostedProfile = Record<string, string>;

export function parseHostedSupabaseProfile(contents: string): HostedProfile {
  const profile: HostedProfile = {};

  contents.split(/\r?\n/u).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      throw new Error(
        `Malformed hosted Supabase profile entry on line ${String(index + 1)}.`,
      );
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!/^[A-Z][A-Z0-9_]*$/u.test(key)) {
      throw new Error(
        `Invalid hosted Supabase profile key on line ${String(index + 1)}.`,
      );
    }
    if (Object.hasOwn(profile, key)) {
      throw new Error(`Duplicate hosted Supabase profile key: ${key}.`);
    }
    profile[key] = value;
  });

  for (const key of requiredProfileKeys) {
    const value = profile[key];
    if (
      value === undefined ||
      value.length === 0 ||
      value === "deleted" ||
      /^<.*>$/u.test(value)
    ) {
      throw new Error(`Missing hosted Supabase profile value: ${key}.`);
    }
  }

  return profile;
}

export function readHostedSupabaseProfile(
  environment: HostedDatabaseEnvironment,
  workspace = process.cwd(),
): HostedProfile {
  const profilePath = path.resolve(
    workspace,
    ".local",
    "supabase",
    `${environment}.env`,
  );
  const profile = parseHostedSupabaseProfile(readFileSync(profilePath, "utf8"));

  if (profile.UNIMIND_DB_ENVIRONMENT !== environment) {
    throw new Error(
      "Hosted Supabase profile environment does not match the requested environment.",
    );
  }
  return profile;
}
