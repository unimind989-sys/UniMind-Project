type QueryPlanNode = Readonly<Record<string, unknown>>;

function asPlanNode(value: unknown): QueryPlanNode {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Availability query plan contains an invalid plan node.");
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
    throw new Error(`Availability query plan is missing numeric ${name}.`);
  }
  return value;
}

export function assertReasonableAvailabilityPlan(planDocument: unknown): void {
  if (!Array.isArray(planDocument) || planDocument.length !== 1) {
    throw new Error(
      "Availability query plan must contain exactly one statement.",
    );
  }
  const statement = asPlanNode(planDocument[0]);
  const root = asPlanNode(statement.Plan);
  const nodes = collectPlanNodes(root);
  const functionScan = nodes.find(
    (node) =>
      node["Node Type"] === "Function Scan" &&
      node["Function Name"] === "available_curriculum_units",
  );
  if (functionScan === undefined) {
    throw new Error(
      "Availability query plan must execute the reviewed availability function.",
    );
  }
  if (numericField(functionScan, "Actual Loops") !== 1) {
    throw new Error(
      "Availability function must execute exactly once per catalog query.",
    );
  }
  if (numericField(functionScan, "Actual Rows") < 500) {
    throw new Error(
      "Availability plan did not run against the representative synthetic fixture.",
    );
  }
  for (const node of nodes) {
    const tempRead = node["Temp Read Blocks"];
    const tempWritten = node["Temp Written Blocks"];
    if (
      (typeof tempRead === "number" && tempRead > 0) ||
      (typeof tempWritten === "number" && tempWritten > 0)
    ) {
      throw new Error(
        "Availability query plan must not spill to temporary blocks.",
      );
    }
    const sortMethod = node["Sort Method"];
    if (typeof sortMethod === "string" && sortMethod.includes("external")) {
      throw new Error(
        "Availability query plan must not use an external disk sort.",
      );
    }
  }
}
