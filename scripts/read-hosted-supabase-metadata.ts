import { createHash } from "node:crypto";

import {
  hostedSupabaseMetadataQuery,
  parseHostedSupabaseMetadata,
} from "./lib/hosted-supabase-metadata";
import { readHostedSupabaseProfile } from "./lib/hosted-supabase-profile";
import { readHostedSupabaseTarget } from "./lib/hosted-supabase-target";

const wrapperArguments = process.argv.slice(2);
if (
  wrapperArguments.length !== 2 ||
  wrapperArguments[0] !== "--environment" ||
  !["development", "ci"].includes(wrapperArguments[1] ?? "")
) {
  throw new Error("Expected --environment development or --environment ci.");
}

const environment = wrapperArguments[1] as "development" | "ci";
const profile = readHostedSupabaseProfile(environment);
const target = readHostedSupabaseTarget(profile);
const accessToken = profile.SUPABASE_ACCESS_TOKEN;
if (accessToken === undefined) {
  throw new Error("Missing hosted Supabase access token.");
}

const response = await fetch(
  `https://api.supabase.com/v1/projects/${target.projectRef}/database/query/read-only`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: hostedSupabaseMetadataQuery }),
  },
);

if (!response.ok) {
  throw new Error(
    `Hosted Supabase metadata query failed with HTTP ${String(response.status)}.`,
  );
}

const metadata = parseHostedSupabaseMetadata(await response.json());
const fingerprint = createHash("sha256")
  .update(target.projectRef)
  .digest("hex")
  .slice(0, 12);

console.log(
  JSON.stringify({
    environment: target.environment,
    projectFingerprint: `sha256:${fingerprint}`,
    ...metadata,
  }),
);
