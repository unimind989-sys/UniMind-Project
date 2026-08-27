import { parse } from "yaml";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectValues(value: unknown, key: string): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((child) => collectValues(child, key));
  }
  if (!isRecord(value)) {
    return [];
  }
  const own = Object.hasOwn(value, key) ? [value[key]] : [];
  return [
    ...own,
    ...Object.values(value).flatMap((child) => collectValues(child, key)),
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

function containsSecretExpression(value: unknown): boolean {
  if (typeof value === "string") {
    return /\$\{\{\s*secrets\./u.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(containsSecretExpression);
  }
  return isRecord(value) && Object.values(value).some(containsSecretExpression);
}

function hasForbiddenTrigger(on: unknown): boolean {
  if (typeof on === "string") {
    return on === "pull_request_target";
  }
  if (Array.isArray(on)) {
    return on.includes("pull_request_target");
  }
  return isRecord(on) && Object.hasOwn(on, "pull_request_target");
}

function hasWritePermission(workflow: UnknownRecord): boolean {
  return collectValues(workflow, "permissions").some(
    (permissions) =>
      permissions === "write-all" ||
      (isRecord(permissions) &&
        Object.values(permissions).some(
          (value) => typeof value === "string" && value.endsWith("write"),
        )),
  );
}

function hasPinnedActions(workflow: UnknownRecord): boolean {
  const actionReference = /^[^@\s]+@[a-f0-9]{40}$/u;
  return collectStrings(workflow, "uses").every((value) =>
    actionReference.test(value),
  );
}

function hasCacheConfiguration(workflow: UnknownRecord): boolean {
  return (
    collectValues(workflow, "cache").length > 0 ||
    collectStrings(workflow, "uses").some((value) =>
      value.startsWith("actions/cache@"),
    )
  );
}

function runs(job: UnknownRecord | undefined): string[] {
  if (job === undefined || !Array.isArray(job.steps)) {
    return [];
  }
  return job.steps.flatMap((step) =>
    isRecord(step) && typeof step.run === "string" ? [step.run] : [],
  );
}

function hasCommand(job: UnknownRecord | undefined, command: string): boolean {
  return runs(job).some((run) => run.includes(command));
}

function commandCount(job: UnknownRecord | undefined, command: string): number {
  return runs(job).reduce((count, run) => {
    let offset = 0;
    let matches = 0;
    while ((offset = run.indexOf(command, offset)) >= 0) {
      matches += 1;
      offset += command.length;
    }
    return count + matches;
  }, 0);
}

function hasFrozenInstall(job: UnknownRecord | undefined): boolean {
  return hasCommand(job, "corepack pnpm install --frozen-lockfile");
}

function hasCorepackActivationBeforeInstall(
  job: UnknownRecord | undefined,
): boolean {
  const jobRuns = runs(job).map((run) => run.trim());
  const activationIndex = jobRuns.indexOf("corepack enable");
  const installIndex = jobRuns.findIndex((run) =>
    run.includes("corepack pnpm install --frozen-lockfile"),
  );
  return activationIndex >= 0 && installIndex > activationIndex;
}

function hasAlwaysUpload(job: UnknownRecord | undefined): boolean {
  if (job === undefined || !Array.isArray(job.steps)) {
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

function hasDependencyAudit(job: UnknownRecord | undefined): boolean {
  if (
    job?.if !== "github.event_name == 'pull_request'" ||
    !Array.isArray(job.steps)
  ) {
    return false;
  }
  const actions = collectStrings(job, "uses");
  const jobRuns = runs(job).map((run) => run.trim());
  const activationIndex = jobRuns.indexOf("corepack enable");
  const auditIndex = jobRuns.indexOf(
    "corepack pnpm audit --audit-level high --prod",
  );
  return (
    actions.some((value) => value.startsWith("actions/checkout@")) &&
    actions.some((value) => value.startsWith("actions/setup-node@")) &&
    activationIndex >= 0 &&
    auditIndex > activationIndex
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

function hasDatabaseCiConcurrency(job: UnknownRecord | undefined): boolean {
  const concurrency = job?.concurrency;
  return (
    isRecord(concurrency) &&
    concurrency.group ===
      "database-ci-${{ github.workflow }}-${{ github.ref }}" &&
    concurrency["cancel-in-progress"] === true
  );
}

function hasCleanup(job: UnknownRecord | undefined): boolean {
  if (job === undefined || !Array.isArray(job.steps)) {
    return false;
  }
  return job.steps.some(
    (step) =>
      isRecord(step) &&
      step.if === "always()" &&
      step.run === "corepack pnpm db:ci:stop",
  );
}

function hasExactRunner(job: UnknownRecord | undefined): boolean {
  return job?.["runs-on"] === "ubuntu-24.04";
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
  if (hasForbiddenTrigger(workflow.on)) violations.push("FORBIDDEN_TRIGGER");
  if (hasWritePermission(workflow)) violations.push("WRITE_PERMISSION");
  if (!hasPinnedActions(workflow)) violations.push("UNPINNED_ACTION");
  if (hasCacheConfiguration(workflow)) violations.push("CACHE_CONFIGURED");

  const permissions = workflow.permissions;
  if (
    !isRecord(permissions) ||
    permissions.contents !== "read" ||
    Object.keys(permissions).length !== 1
  ) {
    violations.push("LEAST_PRIVILEGE_MISSING");
  }

  const jobs = isRecord(workflow.jobs) ? workflow.jobs : {};
  const dependencyAudit = isRecord(jobs["dependency-audit"])
    ? jobs["dependency-audit"]
    : undefined;
  const application = isRecord(jobs.application) ? jobs.application : undefined;
  const databaseCi = isRecord(jobs["database-ci"])
    ? jobs["database-ci"]
    : undefined;

  if (!hasDependencyAudit(dependencyAudit)) {
    violations.push("DEPENDENCY_AUDIT_MISSING");
  }
  if (!hasApplicationConcurrency(application)) {
    violations.push("APPLICATION_CONCURRENCY_MISSING");
  }
  if (!hasCommand(application, "corepack pnpm verify")) {
    violations.push("APPLICATION_GATE_MISSING");
  }
  if (
    !hasCommand(
      application,
      "corepack pnpm exec playwright install --with-deps chromium",
    )
  ) {
    violations.push("CHROMIUM_INSTALL_MISSING");
  }
  if (!hasAlwaysUpload(application)) {
    violations.push("APPLICATION_REPORT_UPLOAD_MISSING");
  }
  if (!hasExactRunner(application)) {
    violations.push("APPLICATION_RUNNER_UNPINNED");
  }

  if (databaseCi === undefined) {
    violations.push("DATABASE_CI_JOB_MISSING");
    return violations;
  }
  if (databaseCi.if !== undefined) {
    violations.push("DATABASE_CI_TRIGGER_UNSAFE");
  }
  if (!hasExactRunner(databaseCi)) {
    violations.push("DATABASE_CI_RUNNER_UNSAFE");
  }
  if (databaseCi.needs !== "application") {
    violations.push("DATABASE_CI_DEPENDENCY_MISSING");
  }
  if (!hasDatabaseCiConcurrency(databaseCi)) {
    violations.push("DATABASE_CI_CONCURRENCY_MISSING");
  }
  if (Object.hasOwn(databaseCi, "environment")) {
    violations.push("DATABASE_CI_ENVIRONMENT_PRESENT");
  }
  if (containsSecretExpression(databaseCi)) {
    violations.push("DATABASE_CI_SECRET_PRESENT");
  }
  if (!hasFrozenInstall(application) || !hasFrozenInstall(databaseCi)) {
    violations.push("FROZEN_INSTALL_MISSING");
  }
  if (
    !hasCorepackActivationBeforeInstall(application) ||
    !hasCorepackActivationBeforeInstall(databaseCi)
  ) {
    violations.push("COREPACK_ENABLE_MISSING");
  }

  for (const command of [
    "db:ci:start",
    "db:ci:migrations",
    "db:ci:types",
    "db:types:check",
    "test:integration:database",
    "test:security",
  ]) {
    if (!hasCommand(databaseCi, command)) {
      violations.push(`DATABASE_CI_COMMAND_MISSING:${command}`);
    }
  }
  if (commandCount(databaseCi, "db:ci:reset") !== 2) {
    violations.push("DATABASE_CI_RESET_COUNT_UNSAFE");
  }
  if (!hasCleanup(databaseCi)) {
    violations.push("DATABASE_CI_CLEANUP_MISSING");
  }
  if (!hasAlwaysUpload(databaseCi)) {
    violations.push("DATABASE_CI_REPORT_UPLOAD_MISSING");
  }

  return violations;
}
