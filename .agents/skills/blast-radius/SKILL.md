---
name: blast-radius
description: Manual review that finds and proves what a code or schema change could break outside its visible diff, from a named fixed point. Use only when the user invokes it. Not a replacement for the ordinary checks or the independent review of a candidate.
---

# Blast radius

Assess change risk beyond direct callers. This is an explicit review workflow (`$blast-radius` in Codex, `/blast-radius` in Claude Code), not a replacement for ordinary implementation checks.

## Inputs

Use the fixed point, branch, commit, PR, or diff named by the user. If none is named, ask for the comparison point before reviewing. Read the applicable `AGENTS.md`, `CONTEXT.md`, work-package task, decision, and ADRs first.

## Process

1. Read the complete diff and commit list. State the observable behavior, contract, data, or timing that changed.
2. Map direct dependencies with symbol and text search, then follow indirect contracts that search can miss:
   - API and event payloads;
   - database columns, migrations, grants, and RLS;
   - cache keys, feature flags, configuration, and environment variables;
   - durable-job transitions, retries, idempotency, usage, and charges;
   - source-version scope, provenance, raw deletion, and derived availability;
   - another runtime, worker, test fixture, or external provider reading the same data.
3. Find the one or two safety facts on which the change depends. Examples: a database constraint rejects the bad transition, every caller supplies the new field, or retries reuse one idempotency key.
4. Push each safety fact as far down this evidence ladder as is practical:
   1. assertion only;
   2. supporting `file:line` or pinned dependency source;
   3. a traced bad case that cannot reach the failure;
   4. an executed focused test or script;
   5. reproduction in the running application.
5. Run the cheapest real proof that can fail if the safety fact is false. Mark anything below level 4 as `UNPROVEN`; never promote a plausible explanation into evidence.
6. Separate confirmed risks from cleared risks. For each confirmed risk, give its trigger, affected behavior, likelihood, impact, and cheapest detection or prevention.

## UniMind risk lenses

Always check the lenses the change can reach, not every lens mechanically:

- authorization isolation and server-only secrets;
- strict-RAG scope, evidence provenance, and unavailable/conflict behavior;
- source lifecycle and verified raw deletion;
- job durability, replay, duplicate state, and duplicate cost;
- derived availability and release controls;
- backward-compatible migrations and clean reset;
- zero-paid-call defaults, budgets, and provider disable paths;
- sanitized logs and evidence bundles.

## Report

- **Change:** the behavior that changed.
- **Safety fact:** the key fact, its evidence level, and executed proof or `UNPROVEN` status.
- **Confirmed risks:** only risks supported by a reachable path.
- **Cleared:** important cases checked and why they are safe.
- **Before merge:** the smallest additional proof still needed.

Use direct, plain prose. Cite real files and commands. Redact private data and secrets.
