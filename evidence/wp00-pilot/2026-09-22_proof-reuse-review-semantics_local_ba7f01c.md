# WP00-T12 proof reuse and review semantics

**State:** PASS when the exact reviewed PR #44 candidate reaches protected `main`; these closure markers are not authoritative before merge

**Task:** WP00-T12

**Implementation source:** `ba7f01c66df330695b53811c97e62e6479397055` (`ba7f01c`)

**Delivery:** PR #44 on `wp00/proof-reuse-review-semantics`

**Environment:** Local Windows repository plus GitHub protected delivery; synthetic/mock-only, credential-free verification

**Profile and envelope:** Ahmed; policy v4; docs, delivery, and tooling; R2/Short; Luna Max floor; active model unverified and reported; zero workers; release-safety; no design gate

## Scope and trust

The repair changes only the existing central policy/router, evidence receipt/fingerprint, review-provenance helper, focused regressions, and their governing documentation. WP03-T04 is untouched and WP03-T05 is not started. No MCP, worker, orchestration layer, telemetry system, alternate verifier, database mutation, hosted product mutation, provider call, private data, or paid action is present.

GitHub account identity proves account separation, not cognitive independence. PR #44's protected rule requires one approving account and the three named checks; it does not require a separate reviewer process. An approval submitted by this executing Codex agent after switching from `unimind989-sys` to `aboayman-oss` is therefore recorded as executor-controlled distinct-account approval. The central regression rejects that provenance when the requested gate is `independent` and accepts independent review only for a completed exact-candidate review by a separate reviewer identity/process.

## Correctness proof

- Proof preflight now maps the selector's final verification array directly into automated obligations. A synthetic future selected check appears without a second mapping change and disappears when no longer selected. Human design acceptance remains the only added non-automated requirement in this scope.
- R3 security proof remains selected centrally through the verification rule's risk selector. Non-preflight phases, unknown paths, pending human acceptance, and explicit unknown visual impact remain non-complete.
- The normal CLI receipt-generation path emitted schema-v2 proof fingerprints from the final selected execution result. Automated proof invalidators come from the selected check's authoritative surface/path rule.
- Generated human design acceptance carries semantic invalidators: material `designJudgment` produces `INVALID`; explicit unknown visual impact or an unclassified relevant path produces `MISSING`; known nonvisual frontend work, backend/runtime work, and docs-only closure preserve it.
- The same generated receipt proved docs-only reuse for application, rendered, and design evidence. The regression does not construct an idealized design receipt by hand.
- Review provenance separates author/approval accounts, executor/reviewer processes, exact candidate identity, and completed examination. Executor-controlled second-account approval cannot satisfy an independent-review requirement.

## Executed verification

- Focused agent-policy regressions: 44/44 passed.
- Strict TypeScript: passed.
- Real `agent:route --pass proof-preflight --emit-receipt-candidate ...` path: emitted schema v2 with selected-check and semantic invalidation metadata.
- Agent policy v4 validation: schema, references, 10 historical cases, and 5 conditional-CI cases passed; conditional CI remains `SHADOW`.
- Repository skill validation: 22 skills, local Markdown references, JSON, invocation syntax, and scripts passed.
- Agent readiness: 194 names, 46 local links, 23 decisions, and 106 task contracts passed.
- Isolated handoff rehearsal: clean committed snapshot selected WP00-T12 while it remained active.
- One credential-free `pnpm verify`: formatting, lint, normal/fresh types, boundaries, 25 migrations, CI/policy audits, 944-file secret scan, 361 unit, 15 integration with 2 expected hosted-only skips, 24 security, 3 evaluation, 5 load-contract, 24 E2E, optimized production build, and client-artifact scan all passed.
- Diff integrity, full changed-file review, scope review, and changed-file secret pattern review passed. No file under WP03-T04 changed.

## Delivery, services, and rollback

PR #44 must merge only its final exact head after required `application`, `dependency-audit`, and `database-ci` checks are green and the authorized second account records one distinct-account approval. The finalizer must fetch and prove synchronized `main`, delete the local/remote task branch, and confirm the clean selector returns WP03-T05. Those external facts complete this conditional record without changing its technical scope.

Supabase and Vercel production promotion are not affected: this is repository execution policy/tooling and documentation only. Vercel preview is CI metadata, not a production release. Rollback is one protected revert of PR #44; no durable service state requires rollback.
