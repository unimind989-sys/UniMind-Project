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

function hasProtectedHostedTrigger(job: UnknownRecord | undefined): boolean {
  return (
    job?.if ===
    "github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')"
  );
}

function hasHostedCommand(job: UnknownRecord, command: string): boolean {
  return collectStrings(job, "run").some((run) => run.includes(command));
}

function hasFrozenInstall(job: UnknownRecord | undefined): boolean {
  return (
    job !== undefined &&
    collectStrings(job, "run").some((run) =>
      run.includes("corepack pnpm install --frozen-lockfile"),
    )
  );
}

function hasApplicationGate(job: UnknownRecord | undefined): boolean {
  return (
    job !== undefined &&
    collectStrings(job, "run").some((run) =>
      run.includes("corepack pnpm verify"),
    )
  );
}

function hasChromiumInstall(job: UnknownRecord | undefined): boolean {
  return (
    job !== undefined &&
    collectStrings(job, "run").some((run) =>
      run.includes(
        "corepack pnpm exec playwright install --with-deps chromium",
      ),
    )
  );
}

function hasHostedTargetEnvironment(job: UnknownRecord): boolean {
  const environment = job.env;
  return isRecord(environment) && environment.UNIMIND_DB_ENVIRONMENT === "ci";
}

function hasScopedHostedSecrets(job: UnknownRecord): boolean {
  if (containsSecretExpression(job.env) || !Array.isArray(job.steps)) {
    return false;
  }
  const secretSteps = job.steps.filter(
    (step) => isRecord(step) && containsSecretExpression(step.env),
  );
  if (secretSteps.length !== 1 || !isRecord(secretSteps[0])) {
    return false;
  }
  const environment = secretSteps[0].env;
  if (!isRecord(environment)) {
    return false;
  }
  const expected = {
    UNIMIND_SUPABASE_PROJECT_REF:
      "${{ secrets.UNIMIND_CI_SUPABASE_PROJECT_REF }}",
    UNIMIND_DB_RESET_CONFIRMATION:
      "${{ secrets.UNIMIND_CI_DB_RESET_CONFIRMATION }}",
    SUPABASE_ACCESS_TOKEN: "${{ secrets.UNIMIND_CI_SUPABASE_ACCESS_TOKEN }}",
    SUPABASE_DB_PASSWORD: "${{ secrets.UNIMIND_CI_SUPABASE_DB_PASSWORD }}",
    NEXT_PUBLIC_SUPABASE_URL: "${{ secrets.UNIMIND_CI_SUPABASE_URL }}",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "${{ secrets.UNIMIND_CI_SUPABASE_PUBLISHABLE_KEY }}",
  } as const;
  const secretEntries = Object.entries(environment).filter(([, value]) =>
    containsSecretExpression(value),
  );
  return (
    secretEntries.length === Object.keys(expected).length &&
    Object.entries(expected).every(([key, value]) => environment[key] === value)
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

function hasDependencyReview(job: UnknownRecord | undefined): boolean {
  return (
    job?.if === "github.event_name == 'pull_request'" &&
    collectStrings(job, "uses").some((value) =>
      value.startsWith("actions/dependency-review-action@"),
    )
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
  if (hasCacheConfiguration(workflow)) {
    violations.push("CACHE_CONFIGURED");
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
  const dependencyReview = isRecord(jobs["dependency-review"])
    ? jobs["dependency-review"]
    : undefined;
  if (!hasDependencyReview(dependencyReview)) {
    violations.push("DEPENDENCY_REVIEW_MISSING");
  }
  const application = isRecord(jobs.application) ? jobs.application : undefined;
  if (!hasApplicationConcurrency(application)) {
    violations.push("APPLICATION_CONCURRENCY_MISSING");
  }
  if (!hasApplicationGate(application)) {
    violations.push("APPLICATION_GATE_MISSING");
  }
  if (!hasChromiumInstall(application)) {
    violations.push("CHROMIUM_INSTALL_MISSING");
  }
  if (application === undefined || !hasAlwaysUpload(application)) {
    violations.push("APPLICATION_REPORT_UPLOAD_MISSING");
  }

  const hosted = isRecord(jobs["hosted-ci"]) ? jobs["hosted-ci"] : undefined;
  if (hosted === undefined) {
    violations.push("HOSTED_JOB_MISSING");
    return violations;
  }
  if (!hasFrozenInstall(application) || !hasFrozenInstall(hosted)) {
    violations.push("FROZEN_INSTALL_MISSING");
  }
  if (!hasSerializedHostedConcurrency(hosted)) {
    violations.push("HOSTED_SERIALIZATION_MISSING");
  }
  if (!hasProtectedHostedTrigger(hosted)) {
    violations.push("HOSTED_TRIGGER_SCOPE_MISSING");
  }
  if (hosted.environment !== "ci" || !hasHostedTargetEnvironment(hosted)) {
    violations.push("HOSTED_TARGET_GUARD_MISSING");
  }
  if (!hasScopedHostedSecrets(hosted)) {
    violations.push("HOSTED_SECRET_SCOPE_UNSAFE");
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
