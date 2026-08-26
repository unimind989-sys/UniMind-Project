import { spawnSync } from "node:child_process";

import { scanFilesForRepositorySecrets } from "./lib/repository-secret-scan";

const result = spawnSync(
  "git",
  ["ls-files", "-co", "--exclude-standard", "-z"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    windowsHide: true,
  },
);
if (result.error !== undefined) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(
    `Repository file discovery failed with status ${String(result.status)}.`,
  );
}

const files = String(result.stdout).split("\0").filter(Boolean);
const violations = await scanFilesForRepositorySecrets(process.cwd(), files);
if (violations.length > 0) {
  for (const violation of violations) {
    console.error(
      `${violation.path}:${String(violation.line)} ${violation.code}`,
    );
  }
  throw new Error(
    `Repository secret scan found ${String(violations.length)} potential credential(s).`,
  );
}
console.log(`Repository secret scan passed for ${String(files.length)} files.`);
