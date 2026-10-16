import { readFileSync } from "node:fs";

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

function hasSafeDatabaseFeedbackDispatch(on: unknown): boolean {
  if (!isRecord(on) || !isRecord(on.workflow_dispatch)) return false;
  const dispatch = on.workflow_dispatch;
  if (!isRecord(dispatch.inputs)) return false;
  const input = dispatch.inputs.database_feedback;
  return (
    isRecord(input) &&
    input.type === "boolean" &&
    input.default === false &&
    Object.keys(dispatch.inputs).length === 1
  );
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
  return job.steps.some((step) => {
    if (
      !isRecord(step) ||
      typeof step.uses !== "string" ||
      !step.uses.startsWith("actions/upload-artifact@") ||
      step.if !== "always()" ||
      !isRecord(step.with) ||
      typeof step.with.path !== "string"
    ) {
      return false;
    }
    const allowedPaths = new Set([
      "test-results/",
      "src/types/database.generated.ts",
    ]);
    const paths = step.with.path
      .split(/\r?\n/u)
      .map((path) => path.trim())
      .filter((path) => path.length > 0);
    return (
      paths.includes("test-results/") &&
      paths.every((path) => allowedPaths.has(path))
    );
  });
}

function hasDependencyAudit(job: UnknownRecord | undefined): boolean {
  if (
    job?.if !==
      "always() && github.event_name == 'pull_request' && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.dependency_audit == 'RUN')" ||
    job.needs !== "ci_selector" ||
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

function hasGuardedSelector(job: UnknownRecord | undefined): boolean {
  if (
    job?.name !== "ci-selector" ||
    job["runs-on"] !== "ubuntu-24.04" ||
    job["timeout-minutes"] !== 10 ||
    !isRecord(job.outputs) ||
    !Array.isArray(job.steps) ||
    job["continue-on-error"] !== undefined ||
    Object.hasOwn(job, "environment") ||
    containsSecretExpression(job)
  )
    return false;
  for (const [key, expression] of Object.entries({
    dependency_audit: "${{ steps.select.outputs.dependency_audit }}",
    application: "${{ steps.select.outputs.application }}",
    database_ci: "${{ steps.select.outputs.database_ci }}",
    all_skipped: "${{ steps.select.outputs.all_skipped }}",
  })) {
    if (job.outputs[key] !== expression) return false;
  }
  const steps = job.steps.filter(isRecord);
  const checkout = steps.find(
    (step) =>
      typeof step.uses === "string" &&
      step.uses.startsWith("actions/checkout@"),
  );
  const selection = steps.find((step) => step.id === "select");
  const docsCheck = steps.find(
    (step) => step.if === "steps.select.outputs.all_skipped == 'true'",
  );
  return (
    isRecord(checkout?.with) &&
    checkout.with["fetch-depth"] === 0 &&
    checkout.with["persist-credentials"] === false &&
    hasExactRunner(job) &&
    hasFrozenInstall(job) &&
    hasCorepackActivationBeforeInstall(job) &&
    runs(job).some((run) => run.includes("corepack pnpm verify:ci-workflow")) &&
    selection?.run === "corepack pnpm exec tsx scripts/select-ci-jobs.ts" &&
    isRecord(selection.env) &&
    selection.env.PR_BASE_SHA === "${{ github.event.pull_request.base.sha }}" &&
    selection.env.PR_HEAD_SHA === "${{ github.event.pull_request.head.sha }}" &&
    selection.env.DATABASE_FEEDBACK === "${{ inputs.database_feedback }}" &&
    typeof docsCheck?.run === "string" &&
    docsCheck.run.includes("corepack pnpm exec prettier . --check") &&
    docsCheck.run.includes("corepack pnpm scan:secrets") &&
    docsCheck.run.includes("corepack pnpm lint:agents")
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

const setupCommands = [
  "db:ci:start",
  "db:ci:upgrade",
  "db:ci:reset",
  "db:ci:reset",
  "db:ci:migrations",
];
const diagnosticCommands = [
  "db:ci:test",
  "db:ci:advisors",
  "db:ci:types",
  "db:types:check",
  "test:integration:database",
  "exec playwright install --with-deps chromium",
  "test:e2e:database",
];
const setupSuccessCondition =
  "${{ always() && steps.database_setup.outcome == 'success' }}";

function jobSteps(job: UnknownRecord): UnknownRecord[] {
  return Array.isArray(job.steps) ? job.steps.filter(isRecord) : [];
}

function hasSafeDatabaseStages(job: UnknownRecord): boolean {
  const steps = jobSteps(job);
  const setup = steps.find((step) => step.id === "database_setup");
  if (
    job["continue-on-error"] !== undefined ||
    steps.some((step) => step["continue-on-error"] !== undefined)
  )
    return false;
  if (
    setup === undefined ||
    typeof setup.run !== "string" ||
    setup.if !== undefined ||
    setup["continue-on-error"] !== undefined
  )
    return false;
  const setupLines = setup.run
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  if (
    setupLines.join("\n") !==
    setupCommands.map((command) => `corepack pnpm ${command}`).join("\n")
  )
    return false;
  const allowedRuns = new Set([
    "corepack enable",
    "corepack pnpm install --frozen-lockfile",
    setup.run.trim(),
    ...diagnosticCommands.map((command) => `corepack pnpm ${command}`),
    "corepack pnpm db:ci:stop",
  ]);
  if (
    steps.some(
      (step) =>
        typeof step.run === "string" && !allowedRuns.has(step.run.trim()),
    )
  )
    return false;
  return diagnosticCommands.every((command) => {
    const matching = steps.filter(
      (step) => step.run === `corepack pnpm ${command}`,
    );
    return (
      matching.length === 1 &&
      matching[0]?.if === setupSuccessCondition &&
      matching[0]?.["continue-on-error"] === undefined
    );
  });
}

const applicationCondition =
  "always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.application == 'RUN')";
const shardArgument = "--shard=${{ matrix.shard }}/${{ strategy.job-total }}";

type ApplicationJob = {
  id: string;
  timeoutMinutes: number;
  chromium: boolean;
  upload: boolean;
  shardedCommand?: string;
};

// Every job here runs under the application selector condition and must
// succeed before the required `application` gate passes.
const applicationJobs: readonly ApplicationJob[] = [
  { id: "static", timeoutMinutes: 20, chromium: false, upload: false },
  { id: "node_tests", timeoutMinutes: 20, chromium: false, upload: true },
  {
    id: "e2e",
    timeoutMinutes: 30,
    chromium: true,
    upload: true,
    shardedCommand: `corepack pnpm test:e2e ${shardArgument}`,
  },
  {
    id: "e2e_demo",
    timeoutMinutes: 30,
    chromium: true,
    upload: true,
    shardedCommand: `corepack pnpm test:e2e:demo --fully-parallel ${shardArgument}`,
  },
];
const applicationGateTimeoutMinutes = 5;

function gateVariable(jobId: string): string {
  return `${jobId.toUpperCase()}_RESULT`;
}

function canonicalGateRun(): string {
  return applicationJobs
    .map(
      ({ id }) =>
        `test "$${gateVariable(id)}" = success || { echo "${id}: $${gateVariable(id)}"; exit 1; }`,
    )
    .join("\n");
}

// One package script per step, with no shell operators that could mask a
// failure (`|| true`, `;`, pipes) or chain unreviewed commands.
const safeApplicationRun =
  /^corepack (enable|pnpm [a-z0-9:-]+(?: [^\s|&;`<>()]+)*)$/u;

function hasStepAdvisoryFailure(job: UnknownRecord): boolean {
  return (
    job["continue-on-error"] !== undefined ||
    jobSteps(job).some((step) => step["continue-on-error"] !== undefined)
  );
}

function hasExactShardMatrix(job: UnknownRecord): boolean {
  const strategy = job.strategy;
  if (
    !isRecord(strategy) ||
    strategy["fail-fast"] !== false ||
    Object.keys(strategy).length !== 2 ||
    !isRecord(strategy.matrix) ||
    Object.keys(strategy.matrix).length !== 1 ||
    !Array.isArray(strategy.matrix.shard)
  )
    return false;
  const shards = strategy.matrix.shard;
  return (
    shards.length > 0 && shards.every((shard, index) => shard === index + 1)
  );
}

function auditApplicationJob(
  spec: ApplicationJob,
  job: UnknownRecord | undefined,
): string[] {
  const { id } = spec;
  if (job === undefined) return [`APPLICATION_JOB_MISSING:${id}`];
  const violations: string[] = [];
  const steps = jobSteps(job);
  if (job.needs !== "ci_selector" || job.if !== applicationCondition)
    violations.push(`APPLICATION_TRIGGER_UNSAFE:${id}`);
  if (!hasExactRunner(job))
    violations.push(`APPLICATION_RUNNER_UNPINNED:${id}`);
  const concurrency = job.concurrency;
  if (
    !isRecord(concurrency) ||
    typeof concurrency.group !== "string" ||
    !concurrency.group.includes("${{ github.ref }}") ||
    (spec.shardedCommand !== undefined &&
      !concurrency.group.includes("${{ matrix.shard }}")) ||
    concurrency["cancel-in-progress"] !== true
  )
    violations.push(`APPLICATION_CONCURRENCY_MISSING:${id}`);
  if (job["timeout-minutes"] !== spec.timeoutMinutes)
    violations.push(`EXECUTION_TIMEOUT_UNSAFE:${id}`);
  if (Object.hasOwn(job, "environment"))
    violations.push(`APPLICATION_ENVIRONMENT_PRESENT:${id}`);
  if (containsSecretExpression(job))
    violations.push(`APPLICATION_SECRET_PRESENT:${id}`);
  if (hasStepAdvisoryFailure(job))
    violations.push(`APPLICATION_ADVISORY_FAILURE:${id}`);
  if (!hasFrozenInstall(job)) violations.push("FROZEN_INSTALL_MISSING");
  if (!hasCorepackActivationBeforeInstall(job))
    violations.push("COREPACK_ENABLE_MISSING");
  if (
    steps.some(
      (step) =>
        step.if !== undefined &&
        !(
          typeof step.uses === "string" &&
          step.uses.startsWith("actions/upload-artifact@")
        ),
    ) ||
    steps.some((step) => step.shell !== undefined)
  )
    violations.push(`APPLICATION_STEP_CONDITIONAL:${id}`);
  if (
    runs(job).some(
      (run) =>
        !safeApplicationRun.test(run.trim()) &&
        run.trim() !== spec.shardedCommand,
    )
  )
    violations.push(`APPLICATION_COMMAND_UNSAFE:${id}`);
  const chromium = hasCommand(
    job,
    "corepack pnpm exec playwright install --with-deps chromium",
  );
  if (spec.chromium && !chromium) violations.push("CHROMIUM_INSTALL_MISSING");
  if (spec.upload && !hasAlwaysUpload(job))
    violations.push(`APPLICATION_REPORT_UPLOAD_MISSING:${id}`);
  if (spec.shardedCommand === undefined) {
    if (job.strategy !== undefined)
      violations.push(`APPLICATION_MATRIX_UNSAFE:${id}`);
  } else if (
    !hasExactShardMatrix(job) ||
    runs(job).filter((run) => run.trim() === spec.shardedCommand).length !== 1
  ) {
    violations.push(`E2E_SHARDING_UNSAFE:${id}`);
  }
  return violations;
}

function auditApplicationGate(job: UnknownRecord | undefined): string[] {
  if (job === undefined) return ["APPLICATION_GATE_UNSAFE"];
  const violations: string[] = [];
  const expectedNeeds = ["ci_selector", ...applicationJobs.map(({ id }) => id)];
  if (job.if !== applicationCondition)
    violations.push("APPLICATION_TRIGGER_UNSAFE:application");
  if (!hasExactRunner(job))
    violations.push("APPLICATION_RUNNER_UNPINNED:application");
  if (job["timeout-minutes"] !== applicationGateTimeoutMinutes)
    violations.push("EXECUTION_TIMEOUT_UNSAFE:application");
  const steps = Array.isArray(job.steps) ? job.steps : [];
  const gate = steps[0];
  const expectedEnv = Object.fromEntries(
    applicationJobs.map(({ id }) => [
      gateVariable(id),
      `\${{ needs.${id}.result }}`,
    ]),
  );
  const gateLines =
    isRecord(gate) && typeof gate.run === "string"
      ? gate.run
          .split(/\r?\n/u)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n")
      : undefined;
  if (
    !Array.isArray(job.needs) ||
    job.needs.length !== expectedNeeds.length ||
    !expectedNeeds.every((need) => (job.needs as unknown[]).includes(need)) ||
    job.strategy !== undefined ||
    job["continue-on-error"] !== undefined ||
    Object.hasOwn(job, "environment") ||
    containsSecretExpression(job) ||
    steps.length !== 1 ||
    !isRecord(gate) ||
    Object.keys(gate).some((key) => !["name", "env", "run"].includes(key)) ||
    !isRecord(gate.env) ||
    Object.keys(gate.env).length !== Object.keys(expectedEnv).length ||
    Object.entries(expectedEnv).some(
      ([name, value]) => (gate.env as UnknownRecord)[name] !== value,
    ) ||
    gateLines !== canonicalGateRun()
  )
    violations.push("APPLICATION_GATE_UNSAFE");
  return violations;
}

function verifyCiComponents(packageJson: string): string[] | undefined {
  let manifest: unknown;
  try {
    manifest = JSON.parse(packageJson);
  } catch {
    return undefined;
  }
  if (!isRecord(manifest) || !isRecord(manifest.scripts)) return undefined;
  const script = manifest.scripts["verify:ci"];
  if (typeof script !== "string") return undefined;
  const components = script.split("&&").map((part) => part.trim());
  const scripts = components.map(
    (component) => /^pnpm ([a-z0-9:-]+)$/u.exec(component)?.[1],
  );
  return scripts.every((name) => name !== undefined)
    ? (scripts as string[])
    : undefined;
}

// Every `verify:ci` component must run in some application job, so a check
// cannot silently disappear from CI when the jobs are split.
function auditVerifyCiCoverage(
  packageJson: string,
  jobRuns: readonly string[],
): string[] {
  const components = verifyCiComponents(packageJson);
  if (components === undefined || components.length === 0)
    return ["VERIFY_CI_UNPARSEABLE"];
  const commands = jobRuns.map((run) => run.trim());
  return components
    .filter(
      (component) =>
        !commands.some(
          (command) =>
            command === `corepack pnpm ${component}` ||
            command.startsWith(`corepack pnpm ${component} `),
        ),
    )
    .map((component) => `VERIFY_CI_COMPONENT_MISSING:${component}`);
}

function hasNonPersistentCheckouts(workflow: UnknownRecord): boolean {
  const jobs = isRecord(workflow.jobs) ? Object.values(workflow.jobs) : [];
  return jobs.every((job) =>
    jobSteps(isRecord(job) ? job : {})
      .filter(
        (step) =>
          typeof step.uses === "string" &&
          step.uses.startsWith("actions/checkout@"),
      )
      .every(
        (step) =>
          isRecord(step.with) && step.with["persist-credentials"] === false,
      ),
  );
}

export type CiWorkflowAuditOptions = {
  /** package.json source; defaults to the repository manifest. */
  packageJson?: string;
};

export function auditCiWorkflow(
  source: string,
  options: CiWorkflowAuditOptions = {},
): string[] {
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
  if (!hasSafeDatabaseFeedbackDispatch(workflow.on))
    violations.push("DATABASE_FEEDBACK_DISPATCH_UNSAFE");
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
  const ciSelector = isRecord(jobs.ci_selector) ? jobs.ci_selector : undefined;
  const dependencyAudit = isRecord(jobs["dependency-audit"])
    ? jobs["dependency-audit"]
    : undefined;
  const application = isRecord(jobs.application) ? jobs.application : undefined;
  const databaseCi = isRecord(jobs["database-ci"])
    ? jobs["database-ci"]
    : undefined;

  if (!hasGuardedSelector(ciSelector)) {
    violations.push("CI_SELECTOR_UNSAFE");
  }
  if (!hasDependencyAudit(dependencyAudit)) {
    violations.push("DEPENDENCY_AUDIT_MISSING");
  }
  if (!hasNonPersistentCheckouts(workflow)) {
    violations.push("CHECKOUT_CREDENTIALS_PERSISTED");
  }
  const applicationRuns: string[] = [];
  for (const spec of applicationJobs) {
    const candidate = jobs[spec.id];
    const job = isRecord(candidate) ? candidate : undefined;
    violations.push(...auditApplicationJob(spec, job));
    applicationRuns.push(...runs(job));
  }
  violations.push(...auditApplicationGate(application));
  violations.push(
    ...auditVerifyCiCoverage(
      options.packageJson ?? readFileSync("package.json", "utf8"),
      applicationRuns,
    ),
  );

  if (databaseCi === undefined) {
    violations.push("DATABASE_CI_JOB_MISSING");
    return [...new Set(violations)];
  }
  if (
    databaseCi.if !==
      "always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.database_ci == 'RUN')" ||
    databaseCi.needs !== "ci_selector"
  ) {
    violations.push("DATABASE_CI_TRIGGER_UNSAFE");
  }
  if (!hasExactRunner(databaseCi)) {
    violations.push("DATABASE_CI_RUNNER_UNSAFE");
  }
  if (!hasDatabaseCiConcurrency(databaseCi)) {
    violations.push("DATABASE_CI_CONCURRENCY_MISSING");
  }
  if (databaseCi["timeout-minutes"] !== 30) {
    violations.push("EXECUTION_TIMEOUT_UNSAFE:database-ci");
  }
  if (Object.hasOwn(databaseCi, "environment")) {
    violations.push("DATABASE_CI_ENVIRONMENT_PRESENT");
  }
  if (containsSecretExpression(databaseCi)) {
    violations.push("DATABASE_CI_SECRET_PRESENT");
  }
  if (!hasFrozenInstall(databaseCi)) {
    violations.push("FROZEN_INSTALL_MISSING");
  }
  if (!hasCorepackActivationBeforeInstall(databaseCi)) {
    violations.push("COREPACK_ENABLE_MISSING");
  }

  for (const command of [
    "db:ci:start",
    "db:ci:upgrade",
    "db:ci:migrations",
    "db:ci:test",
    "db:ci:advisors",
    "db:ci:types",
    "db:types:check",
    "test:integration:database",
  ]) {
    if (!hasCommand(databaseCi, command)) {
      violations.push(`DATABASE_CI_COMMAND_MISSING:${command}`);
    }
  }
  if (commandCount(databaseCi, "db:ci:reset") !== 2) {
    violations.push("DATABASE_CI_RESET_COUNT_UNSAFE");
  }
  if (!hasSafeDatabaseStages(databaseCi))
    violations.push("DATABASE_CI_STAGES_UNSAFE");
  if (!hasCleanup(databaseCi)) {
    violations.push("DATABASE_CI_CLEANUP_MISSING");
  }
  if (!hasAlwaysUpload(databaseCi)) {
    violations.push("DATABASE_CI_REPORT_UPLOAD_MISSING");
  }

  return [...new Set(violations)];
}
