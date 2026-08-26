import { parse } from "yaml";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectRecords(value: unknown, key: string): UnknownRecord[] {
  if (!isRecord(value)) {
    return [];
  }
  const own = isRecord(value[key]) ? [value[key] as UnknownRecord] : [];
  return [
    ...own,
    ...Object.values(value).flatMap((child) => collectRecords(child, key)),
  ];
}

function collectStrings(value: unknown, key: string): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((child) => collectStrings(child, key));
  }
  if (!isRecord(value)) {
    return [];
  }
  const own = typeof value[key] === "string" ? [value[key] as string] : [];
  return [
    ...own,
    ...Object.values(value).flatMap((child) => collectStrings(child, key)),
  ];
}

function hasForbiddenTrigger(on: unknown): boolean {
  if (Array.isArray(on)) {
    return on.includes("pull_request_target");
  }
  return isRecord(on) && Object.hasOwn(on, "pull_request_target");
}

function hasWritePermission(workflow: UnknownRecord): boolean {
  return collectRecords(workflow, "permissions").some((permissions) =>
    Object.values(permissions).some(
      (value) => typeof value === "string" && value.endsWith("write"),
    ),
  );
}

function hasPinnedActions(workflow: UnknownRecord): boolean {
  const actionReference = /^[^@\s]+@[a-f0-9]{40}$/u;
  return collectStrings(workflow, "uses").every((value) =>
    actionReference.test(value),
  );
}

function hasApplicationConcurrency(job: UnknownRecord | undefined): boolean {
  const concurrency = job?.concurrency;
  return (
    isRecord(concurrency) &&
    typeof concurrency.group === "string" &&
    concurrency.group.includes("github.ref") &&
    concurrency["cancel-in-progress"] === true
  );
}

function hasSerializedHostedConcurrency(
  job: UnknownRecord | undefined,
): boolean {
  const concurrency = job?.concurrency;
  return (
    isRecord(concurrency) &&
    concurrency.group === "unimind-hosted-ci-database" &&
    concurrency["cancel-in-progress"] === false
  );
}

function hasHostedCommand(job: UnknownRecord, command: string): boolean {
  return collectStrings(job, "run").some((run) => run.includes(command));
}

function hasSafeHostedSecrets(job: UnknownRecord): boolean {
  const environment = job.env;
  if (!isRecord(environment) || environment.UNIMIND_DB_ENVIRONMENT !== "ci") {
    return false;
  }
  const expressions = Object.values(environment).filter(
    (value): value is string =>
      typeof value === "string" && value.includes("secrets."),
  );
  return (
    expressions.length >= 6 &&
    expressions.every((value) => value.includes("secrets.UNIMIND_CI_"))
  );
}

function hasAlwaysUpload(job: UnknownRecord): boolean {
  if (!Array.isArray(job.steps)) {
    return false;
  }
  return job.steps.some(
    (step) =>
      isRecord(step) &&
      typeof step.uses === "string" &&
      step.uses.startsWith("actions/upload-artifact@") &&
      step.if === "always()" &&
      isRecord(step.with) &&
      step.with.path === "test-results/",
  );
}

export function auditCiWorkflow(source: string): string[] {
  let workflow: unknown;
  try {
    workflow = parse(source);
  } catch {
    return ["INVALID_YAML"];
  }
  if (!isRecord(workflow)) {
    return ["INVALID_WORKFLOW"];
  }

  const violations: string[] = [];
  if (hasForbiddenTrigger(workflow.on)) {
    violations.push("FORBIDDEN_TRIGGER");
  }
  if (hasWritePermission(workflow)) {
    violations.push("WRITE_PERMISSION");
  }
  if (!hasPinnedActions(workflow)) {
    violations.push("UNPINNED_ACTION");
  }
  const permissions = workflow.permissions;
  if (
    !isRecord(permissions) ||
    permissions.contents !== "read" ||
    Object.keys(permissions).length !== 1
  ) {
    violations.push("LEAST_PRIVILEGE_MISSING");
  }

  const jobs = isRecord(workflow.jobs) ? workflow.jobs : {};
  const application = isRecord(jobs.application)
    ? jobs.application
    : undefined;
  if (!hasApplicationConcurrency(application)) {
    violations.push("APPLICATION_CONCURRENCY_MISSING");
  }
  if (application === undefined || !hasAlwaysUpload(application)) {
    violations.push("APPLICATION_REPORT_UPLOAD_MISSING");
  }

  const hosted = isRecord(jobs["hosted-ci"])
    ? jobs["hosted-ci"]
    : undefined;
  if (hosted === undefined) {
    violations.push("HOSTED_JOB_MISSING");
    return violations;
  }
  if (!hasSerializedHostedConcurrency(hosted)) {
    violations.push("HOSTED_SERIALIZATION_MISSING");
  }
  if (hosted.environment !== "ci" || !hasSafeHostedSecrets(hosted)) {
    violations.push("HOSTED_TARGET_GUARD_MISSING");
  }
  for (const command of [
    "db:push:dry-run",
    "db:reset",
    "db:migrations",
    "db:types",
    "db:types:check",
    "test:integration:hosted:ci",
    "test:security",
  ]) {
    if (!hasHostedCommand(hosted, command)) {
      violations.push(`HOSTED_COMMAND_MISSING:${command}`);
    }
  }
  if (!hasAlwaysUpload(hosted)) {
    violations.push("HOSTED_REPORT_UPLOAD_MISSING");
  }
  return violations;
}
