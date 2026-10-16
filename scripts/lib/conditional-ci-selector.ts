import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

export type CiPathConfig = {
  surfaces: string[];
  paths: { pattern: string; surfaces: string[] }[];
  safe_docs_only_patterns: string[];
  force_full_patterns: string[];
  jobs: {
    id: string;
    required_surfaces: string[];
    path_patterns: string[];
    needs: string[];
  }[];
};

export type CiSelection = {
  dependencyAudit: "RUN" | "WOULD_SKIP";
  application: "RUN" | "WOULD_SKIP";
  databaseCi: "RUN" | "WOULD_SKIP";
  reason: string;
};

const fullSelection: CiSelection = {
  dependencyAudit: "RUN",
  application: "RUN",
  databaseCi: "RUN",
  reason: "full CI required",
};

const jobIds = ["dependency-audit", "application", "database-ci"];

export function loadCiPathConfig(
  configPath = path.resolve("docs/agents/ci-paths.yaml"),
): CiPathConfig {
  const config = parse(readFileSync(configPath, "utf8")) as CiPathConfig;
  const failures = validateCiPathConfig(config);
  if (failures.length > 0)
    throw new Error(`Invalid CI path config: ${failures.join("; ")}`);
  return config;
}

export function validateCiPathConfig(config: CiPathConfig): string[] {
  const failures: string[] = [];
  const known = new Set(config.surfaces ?? []);
  const patterns = [
    ...(config.paths ?? []).map((rule) => rule.pattern),
    ...(config.safe_docs_only_patterns ?? []),
    ...(config.force_full_patterns ?? []),
    ...(config.jobs ?? []).flatMap((job) => job.path_patterns),
  ];
  for (const pattern of patterns) {
    try {
      new RegExp(pattern, "i");
    } catch {
      failures.push(`invalid pattern ${pattern}`);
    }
  }
  for (const key of [
    "paths",
    "safe_docs_only_patterns",
    "force_full_patterns",
  ] as const)
    if (!Array.isArray(config[key]) || config[key].length === 0)
      failures.push(`${key} must be a non-empty list`);
  for (const rule of config.paths ?? [])
    for (const surface of rule.surfaces)
      if (!known.has(surface)) failures.push(`unknown surface ${surface}`);
  for (const job of config.jobs ?? [])
    for (const surface of job.required_surfaces)
      if (!known.has(surface))
        failures.push(`${job.id} requires unknown surface ${surface}`);
  const ids = (config.jobs ?? []).map((job) => job.id);
  if (ids.join() !== jobIds.join())
    failures.push(`jobs must be exactly ${jobIds.join(", ")}`);
  for (const job of config.jobs ?? [])
    for (const dependency of job.needs)
      if (!ids.includes(dependency))
        failures.push(`${job.id} needs unknown job ${dependency}`);
  return failures;
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

export function surfacesForPath(
  config: CiPathConfig,
  changedPath: string,
): string[] {
  const surfaces = new Set<string>();
  for (const rule of config.paths)
    if (new RegExp(rule.pattern, "i").test(changedPath))
      for (const surface of rule.surfaces) surfaces.add(surface);
  return config.surfaces.filter((surface) => surfaces.has(surface));
}

export function assertExactPrMergeParents(
  parentLine: string,
  baseSha: string,
  headSha: string,
): { baseSha: string; headSha: string } {
  if (!/^[a-f0-9]{40}$/u.test(baseSha) || !/^[a-f0-9]{40}$/u.test(headSha))
    throw new Error("PR base or head SHA is missing or malformed.");
  const parents = parentLine.trim().split(" ");
  if (
    parents.length !== 3 ||
    !parents.every((sha) => /^[a-f0-9]{40}$/u.test(sha)) ||
    parents[1] !== baseSha ||
    parents[2] !== headSha
  )
    throw new Error(
      "Checked-out PR merge commit does not match event base and head.",
    );
  return { baseSha, headSha };
}

export function selectCiJobs(input: {
  config: CiPathConfig;
  event: "pull_request" | "push" | "workflow_dispatch";
  changedPaths?: string[];
  databaseFeedback?: boolean;
}): CiSelection {
  const { config } = input;
  if (input.event === "push")
    return { ...fullSelection, reason: "main push always runs full CI" };
  if (input.event === "workflow_dispatch") {
    return input.databaseFeedback === true
      ? {
          dependencyAudit: "WOULD_SKIP",
          application: "WOULD_SKIP",
          databaseCi: "RUN",
          reason: "explicit manual database feedback",
        }
      : { ...fullSelection, reason: "default manual dispatch runs full CI" };
  }
  const paths = input.changedPaths;
  if (
    paths === undefined ||
    paths.length === 0 ||
    paths.some(
      (changedPath) =>
        changedPath.length === 0 ||
        changedPath.startsWith("/") ||
        changedPath.includes("\\") ||
        changedPath.split("/").includes(".."),
    )
  ) {
    return { ...fullSelection, reason: "missing or malformed PR diff" };
  }

  const conservativePath = paths.find((changedPath) => {
    const pathSurfaces = surfacesForPath(config, changedPath);
    return (
      pathSurfaces.length === 0 ||
      matchesAny(changedPath, config.force_full_patterns) ||
      (pathSurfaces.length === 1 &&
        pathSurfaces[0] === "docs" &&
        !matchesAny(changedPath, config.safe_docs_only_patterns))
    );
  });
  if (conservativePath !== undefined)
    return {
      ...fullSelection,
      reason: `conservative full CI for ${conservativePath}`,
    };

  const surfaces = new Set(
    paths.flatMap((changedPath) => surfacesForPath(config, changedPath)),
  );
  const reasons = new Map<string, string>();
  for (const job of config.jobs) {
    const matchedSurface = job.required_surfaces.find((surface) =>
      surfaces.has(surface),
    );
    const matchedPath = paths.find((changedPath) =>
      matchesAny(changedPath, job.path_patterns),
    );
    if (matchedSurface !== undefined)
      reasons.set(job.id, `required by ${matchedSurface} surface`);
    else if (matchedPath !== undefined)
      reasons.set(job.id, `required by changed path ${matchedPath}`);
  }
  let widened = true;
  while (widened) {
    widened = false;
    for (const job of config.jobs) {
      if (!reasons.has(job.id)) continue;
      for (const dependency of job.needs) {
        if (reasons.has(dependency)) continue;
        reasons.set(dependency, `required by ${job.id} dependency`);
        widened = true;
      }
    }
  }

  const action = (id: string): "RUN" | "WOULD_SKIP" =>
    reasons.has(id) ? "RUN" : "WOULD_SKIP";
  return {
    dependencyAudit: action("dependency-audit"),
    application: action("application"),
    databaseCi: action("database-ci"),
    reason: jobIds
      .map(
        (id) =>
          `${id}: ${reasons.get(id) ?? "no affected surface, path, or dependency"}`,
      )
      .join("; "),
  };
}
