# Task record: WP01-T09 provision isolated environments

**Task ID:** WP01-T09

**Status:** [?]

**Outcome:** Local, preview, and beta environments are isolated by project, namespace, callback, secret scope, data classification, owner, health checks, promotion, and rollback procedure.

**Owner:** Codex `/root` after WP01-T08 PASS and owner provisioning approval

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-23

## Execution contract

**Dependencies:** WP01-T04 through WP01-T08 reviewed PASS; Ahmed/Ziad approval and signed-in access for separate preview/beta Supabase and deployment resources; applicable data/provider decisions.

**Inputs:** Runbook WP01-T09; approved D-21; approved environment owners/scopes; versioned hosted development/database/Auth/CI contracts; synthetic preview and rights-approved beta data rules; confirmed founder-computers-are-development-process-only constraint.

**Files:** Environment matrix, liveness/readiness routes, deployment/smoke/rollback automation, task/runbook state, and evidence; external project identifiers only when safely public.

**Verify:** Isolation review; preview deploy/smoke; forbidden-route and mock-mode checks; beta remains locked; secret and topology redaction review.

**Pass:** Preview and beta use separate projects/scopes and approved external hosting; preview is synthetic/mock-only; an approved tested commit can promote and roll back without manual schema repair; all runtime components remain operable when both founder computers are off.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_environment-isolation_<environment>_<short-sha>.md`

**Rollback:** Roll back the future web/worker release to its prior tested commit and use forward-only database recovery; never point preview at beta data to recover.

**Hard stop:** Do not use a founder computer as a preview/beta host or dependency. Do not provision, deploy, write secrets, expose topology, unlock beta, use real source/student data, or enable providers without named owner authorization and all prerequisite gates.

## Steps

- [?] Wait for WP01-T04 through WP01-T08 and external provisioning authorization.
- [ ] Record the complete workstation-development/hosted-development/hosted-CI/preview/beta isolation matrix, including reset permissions and the noncritical Telegram test-tool boundary.
- [ ] Implement redacted liveness/readiness and post-deploy smoke seams.
- [ ] Configure preview automation and approved beta promotion/rollback.
- [ ] Prove separate projects, safe data profiles, and locked beta.

## Handoff

**Changed:** No environment provisioned or deployment performed; the full prerequisite and authority boundary is durable, including the confirmed exclusion of founder computers from hosting.

**Commands:** Prior documentation synchronization passed agent readiness and the isolated committed-snapshot handoff. No provisioning, deployment, or runtime smoke command ran because hosted development/database/Auth/CI gates and signed-in external resources remain unavailable; current D-21 verification is recorded in WP01-T04.

**Remaining:** Entire WP01-T09 implementation after prerequisites and explicit provisioning authority.

**Next safe action:** Complete WP01-T04 through WP01-T08, then use the appropriate setup/deployment workflows with named owners and safe environment scopes.

**Reviewer action:** Assign before provisioning; environment isolation, secret scope, beta lock, and rollback require direct evidence.
