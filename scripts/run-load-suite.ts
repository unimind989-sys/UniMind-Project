import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";

import {
  createLoadDryRunReport,
  parseLoadProfile,
  renderLoadDryRunMarkdown,
} from "./lib/load-profile";

const profilePath = path.resolve(
  process.argv[2] ?? "planning/load-profile-100-students.yaml",
);
const outputDirectory = path.resolve(process.argv[3] ?? "test-results/load");
const source = await readFile(profilePath, "utf8");
const profile = parseLoadProfile(parse(source));
const report = createLoadDryRunReport(profile);

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "load-profile.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    path.join(outputDirectory, "load-profile.md"),
    renderLoadDryRunMarkdown(report),
    "utf8",
  ),
]);

console.log(
  `Validated zero-cost load profile '${report.profileId}' without executing workload.`,
);
