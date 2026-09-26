import {
  classifyChangedPaths,
  predictConditionalCiJobs,
  type AgentExecutionPolicy,
} from "./agent-execution-policy";

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
  policy: AgentExecutionPolicy;
  event: "pull_request" | "push" | "workflow_dispatch";
  changedPaths?: string[];
  databaseFeedback?: boolean;
}): CiSelection {
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
      (path) =>
        path.length === 0 ||
        path.startsWith("/") ||
        path.includes("\\") ||
        path.split("/").includes(".."),
    )
  ) {
    return { ...fullSelection, reason: "missing or malformed PR diff" };
  }
  const classification = classifyChangedPaths(input.policy, paths, true);
  const predictions = predictConditionalCiJobs(
    input.policy,
    classification.surfaces,
    paths,
  );
  const action = (id: string): "RUN" | "WOULD_SKIP" => {
    const found = predictions.find((prediction) => prediction.id === id);
    return found?.action ?? "RUN";
  };
  return {
    dependencyAudit: action("dependency-audit"),
    application: action("application"),
    databaseCi: action("database-ci"),
    reason: predictions
      .map((prediction) => `${prediction.id}: ${prediction.reason}`)
      .join("; "),
  };
}
