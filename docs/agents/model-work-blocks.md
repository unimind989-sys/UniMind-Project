# Manual Sol/Luna work blocks

The user selects the model in Codex Desktop and opens a fresh chat at a model boundary. Repository policy cannot read, verify, or change that selection. Use GPT-6 Sol at high reasoning (Sol High) for planning every new runbook task. Use GPT-6 Luna at max reasoning (Luna Max) for an assigned implementation block when the conditions below hold. The aim is equal or better task quality with fewer rate-limit resources; actual Codex Desktop savings are unproven. Lower API price does not prove Desktop rate-limit savings, and GPT-6 Luna is not established as uniformly more reliable than 5.6 Luna.

## Plan in Sol High

1. Read the selected task's runbook acceptance, dependencies, relevant product/decision authority, current code, and evidence. Resolve intended behavior, boundaries, and open decisions before assigning implementation.
2. Write the fewest useful **ordered work blocks** in the task record. Keep related changes and their checks in one coherent block. Split only when expected usage saving outweighs a new chat, repeated context, and handoff effort. A substantial multi-file feature can be one Luna block.
3. For each block, name the model, scope, governing inputs, independently specified acceptance checks including relevant failure/forbidden cases, and completion evidence. Keep delivery, merge, affected production proof, and cleanup in the plan where the requested lifecycle requires them. Record why Luna is confidently recommended or why Sol judgment is needed.
4. Tell the user the model for the next fresh chat. The next chat reads the task record and completes its contiguous assigned blocks, then updates the record and tells the user the next model. Replan in Sol when a governing requirement changes.

## Assign Luna Max

Assign Luna Max only when all four conditions hold:

- Intended behavior and important boundaries are decided.
- The block is large and coherent enough to justify a separate chat.
- Acceptance checks are independent of the proposed implementation and cover relevant failure cases.
- Errors can be detected and repaired without inventing or changing a governing requirement.

Luna Max can own substantial coding: coherent multi-file features, defined algorithms, product UI with approved behavior and design direction, test harnesses, and other implementation with meaningful checks. Sol High is the fallback when Luna is only possible rather than confidently recommended. Sol owns unresolved requirements, unclear cross-system invariants, consequential trust or irreversible-state decisions, difficult diagnosis, and judgments about incomplete or conflicting evidence. Risk controls verification and approvals independently of model choice; protected work is not automatically assigned to Sol if its implementation is fully bounded and checkable.

## Execute and hand off

The assigned chat completes contiguous blocks for its selected model. It runs the checks required by the runbook, task contract, and actual diff, records results and invalidations, and continues through delivery when assigned and authorized. No model choice waives a check, founder decision, branch protection, or financial stop.

Luna repairs a routine failure with a clear cause and fix within its assignment. If it finds an unresolved invariant, contradictory behavior, unclear protected rule, repeated acceptance failure, or growing repair effort, it stops changing that block's governing behavior. It records the diff, failed and passing evidence, unresolved question, and next safe action in the task record, then asks the user to select Sol High in a fresh chat for **the same block**. Sol resolves the issue against authority, updates the block and checks if needed, and can return bounded implementation to Luna when the four conditions hold again. Neither chat treats its own confidence as proof of safety.

At every model boundary, leave a reproducible handoff in the task record: block status, changed paths, exact commands/results, decisions and source references, remaining acceptance criteria, evidence validity, and next model. The final chat completes the requested lifecycle and confirms the repository and task state are clean.
