import { createHash } from "node:crypto";

import { z } from "zod";

import { deriveAvailability } from "../../src/lib/availability/derive-availability.domain";

const availabilityFactsSchema = z.object({
  hasActiveMembership: z.boolean(),
  cohortReleased: z.boolean(),
  unitPublished: z.boolean(),
  hasActiveReadySource: z.boolean(),
  rightsValid: z.boolean(),
  curriculumEditionMatches: z.boolean(),
});

const evaluationCaseSchema = z.object({
  schema_version: z.literal(1),
  dataset_id: z.string().min(1),
  case_id: z.string().min(1),
  input: availabilityFactsSchema,
  expected: z.object({
    available: z.boolean(),
    reasons: z.array(z.string()),
  }),
});

type EvaluationCaseResult = Readonly<{
  caseId: string;
  status: "PASS" | "FAIL";
  message: string;
}>;

export type FoundationEvaluationReport = Readonly<{
  schemaVersion: 1;
  datasetId: string;
  datasetSha256: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  status: "PASS" | "FAIL";
  cases: readonly EvaluationCaseResult[];
}>;

export function runFoundationEvaluation(
  jsonl: string,
): FoundationEvaluationReport {
  const lines = jsonl
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length === 0) {
    throw new Error("Evaluation dataset contains no JSONL cases.");
  }

  const cases = lines.map((line, index) => {
    let value: unknown;
    try {
      value = JSON.parse(line) as unknown;
    } catch {
      throw new Error(
        `Evaluation dataset line ${String(index + 1)} is not valid JSON.`,
      );
    }
    const result = evaluationCaseSchema.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new Error(
        `Evaluation dataset line ${String(index + 1)} is invalid at '${issue?.path.join(".") || "case"}': ${issue?.message ?? "unknown validation error"}`,
      );
    }
    return result.data;
  });

  const datasetId = cases[0]?.dataset_id;
  if (datasetId === undefined) {
    throw new Error("Evaluation dataset contains no parsed cases.");
  }
  if (cases.some((item) => item.dataset_id !== datasetId)) {
    throw new Error("Every evaluation case must share one dataset_id.");
  }
  if (new Set(cases.map((item) => item.case_id)).size !== cases.length) {
    throw new Error("Every evaluation case_id must be unique.");
  }

  const results = cases.map<EvaluationCaseResult>((item) => {
    const actual = deriveAvailability(item.input);
    const matches =
      actual.available === item.expected.available &&
      JSON.stringify(actual.reasons) === JSON.stringify(item.expected.reasons);
    return {
      caseId: item.case_id,
      status: matches ? "PASS" : "FAIL",
      message: matches
        ? "Observed output matched the versioned expectation."
        : `Expected available=${String(item.expected.available)} with reasons [${item.expected.reasons.join(",")}]; received available=${String(actual.available)} with reasons [${actual.reasons.join(",")}].`,
    };
  });
  const failedCases = results.filter((item) => item.status === "FAIL").length;

  return {
    schemaVersion: 1,
    datasetId,
    datasetSha256: createHash("sha256").update(jsonl).digest("hex"),
    totalCases: results.length,
    passedCases: results.length - failedCases,
    failedCases,
    status: failedCases === 0 ? "PASS" : "FAIL",
    cases: results,
  };
}

export function renderFoundationEvaluationMarkdown(
  report: FoundationEvaluationReport,
): string {
  const rows = report.cases.map(
    (item) => `| ${item.caseId} | ${item.status} | ${item.message} |`,
  );
  return [
    "# Foundation evaluation report",
    "",
    `- Dataset: \`${report.datasetId}\``,
    `- SHA-256: \`${report.datasetSha256}\``,
    `- Outcome: \`${report.status}\``,
    `- Passed: ${String(report.passedCases)}/${String(report.totalCases)}`,
    "",
    "| Case | Status | Detail |",
    "| --- | --- | --- |",
    ...rows,
    "",
    "This synthetic foundation report proves the runner contract only; it is not an academic quality gate.",
    "",
  ].join("\n");
}
