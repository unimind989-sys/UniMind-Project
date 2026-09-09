type QueryPlanNode = Readonly<Record<string, unknown>>;

function asPlanNode(value: unknown): QueryPlanNode {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Retrieval query plan contains an invalid plan node.");
  }
  return value as QueryPlanNode;
}

function collectPlanNodes(root: QueryPlanNode): readonly QueryPlanNode[] {
  const nodes: QueryPlanNode[] = [];
  const pending: QueryPlanNode[] = [root];
  while (pending.length > 0) {
    const node = pending.pop();
    if (node === undefined) {
      continue;
    }
    nodes.push(node);
    const children = node.Plans;
    if (Array.isArray(children)) {
      for (const child of children) {
        pending.push(asPlanNode(child));
      }
    }
  }
  return nodes;
}

function numericField(node: QueryPlanNode, name: string): number {
  const value = node[name];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Retrieval query plan is missing numeric ${name}.`);
  }
  return value;
}

function statementPlan(planDocument: unknown): QueryPlanNode {
  if (!Array.isArray(planDocument) || planDocument.length !== 1) {
    throw new Error("Retrieval query plan must contain exactly one statement.");
  }
  const statement = asPlanNode(planDocument[0]);
  return asPlanNode(statement.Plan);
}

function usesIndex(
  nodes: readonly QueryPlanNode[],
  indexName: string,
): boolean {
  return nodes.some((node) => node["Index Name"] === indexName);
}

export function assertReasonableRetrievalPlan(
  planDocument: unknown,
  bodyPlanDocument: unknown,
): void {
  const root = statementPlan(planDocument);
  const nodes = collectPlanNodes(root);
  const functionScan = nodes.find(
    (node) =>
      node["Node Type"] === "Function Scan" &&
      node["Function Name"] === "retrieve_authorized_segments",
  );
  if (functionScan === undefined) {
    throw new Error(
      "Retrieval query plan must execute the reviewed retrieval function.",
    );
  }
  if (numericField(functionScan, "Actual Loops") !== 1) {
    throw new Error(
      "Retrieval function must execute exactly once per retrieval request.",
    );
  }
  if (numericField(functionScan, "Actual Rows") !== 50) {
    throw new Error(
      "Retrieval plan did not return the representative bounded result set.",
    );
  }

  const bodyRoot = statementPlan(bodyPlanDocument);
  const bodyNodes = collectPlanNodes(bodyRoot);
  if (numericField(bodyRoot, "Actual Rows") !== 50) {
    throw new Error(
      "Installed retrieval SQL body did not return the representative bounded result set.",
    );
  }

  for (const relation of [
    "source_segments",
    "segment_embeddings",
    "source_versions",
    "source_assets",
    "curriculum_units",
    "cohorts",
    "cohort_releases",
  ]) {
    if (!bodyNodes.some((node) => node["Relation Name"] === relation)) {
      throw new Error(`Installed retrieval SQL body is missing ${relation}.`);
    }
  }

  for (const indexName of [
    "source_segments_retrieval_scope_idx",
    "segment_embeddings_synthetic_v1_cosine_hnsw_idx",
    "source_segments_content_search_idx",
  ]) {
    if (!usesIndex(bodyNodes, indexName)) {
      throw new Error(`Retrieval query plan must use ${indexName}.`);
    }
  }

  for (const node of [...nodes, ...bodyNodes]) {
    if (
      node["Node Type"] === "Seq Scan" &&
      ["source_segments", "segment_embeddings"].includes(
        String(node["Relation Name"]),
      ) &&
      numericField(node, "Actual Rows") +
        Number(node["Rows Removed by Filter"] ?? 0) >=
        1_000
    ) {
      throw new Error(
        "Retrieval query plan must not sequentially scan a representative segment corpus.",
      );
    }
    const tempRead = node["Temp Read Blocks"];
    const tempWritten = node["Temp Written Blocks"];
    if (
      (typeof tempRead === "number" && tempRead > 0) ||
      (typeof tempWritten === "number" && tempWritten > 0)
    ) {
      throw new Error(
        "Retrieval query plan must not spill to temporary blocks.",
      );
    }
    const sortMethod = node["Sort Method"];
    if (typeof sortMethod === "string" && sortMethod.includes("external")) {
      throw new Error(
        "Retrieval query plan must not use an external disk sort.",
      );
    }
  }
}
