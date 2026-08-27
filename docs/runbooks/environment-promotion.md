# Preview and Beta environment promotion

Use this procedure only for WP01-T09 after WP01-T08 proves ephemeral database/Auth CI and the environment matrix names the two repurposed Supabase Free projects plus separate Vercel Hobby project scopes. It does not authorize spend, real data, Beta unlock, or paid-provider enablement.

## Preconditions

- D-21 and ADR-0001 remain applicable: Ahmed's reported Vercel confirmation covers the current phase, Hobby eligibility has no open trigger, and no paid plan, trial, add-on, or billable resource is used.
- WP01-T08 ephemeral CI passes without a persistent Supabase CI project or long-lived database credentials.
- Preview and Beta have different database projects, Vercel project scopes, storage namespaces, callback bases, queue/worker namespaces, and secrets. Transitional development/CI credentials are rotated and absent from both.
- Preview contains synthetic data and uses mock providers. Beta remains locked and contains no real data until its later rights and release gates pass.
- Before Beta receives real data, an approved encrypted backup/restore procedure has passed a rehearsal or separately approved paid backup capacity is active. Free-plan project pausing is included in the recovery procedure.
- The deployment provider and CLI version are pinned before automation is committed. Provider IDs and tokens stay in the provider secret store or ignored local state.
- The candidate commit has passed `pnpm verify`; schema changes have a versioned forward migration and a tested recovery path.

Stop if any precondition is unknown. Never point one environment at another environment's data to make a deployment pass.

## Preview candidate

1. Let the approved Git integration deploy the pull-request commit to the Preview deployment target. Pull-request code must not receive Beta secrets.
2. Record the commit SHA and provider deployment ID without copying tokens, signed URLs, or internal topology into Git.
3. Run:

   ```powershell
   corepack pnpm smoke:deployment -- --base-url https://approved-preview.example --target preview
   ```

4. Require all six checks: live response, live write denial, ready response, ready write denial, application response, and synthetic/mock-only mode.
5. Preserve a sanitized report. A screenshot does not replace the command result or authorization tests.

## Locked Beta candidate

1. Select the exact commit SHA that passed Preview. Do not build from an unreviewed branch tip or manually copy files between deployments.
2. Deploy that commit under the Beta deployment target and Beta-scoped configuration. If a provider's artifact promotion would retain Preview-bound environment values, rebuild the same commit under Beta scope instead of promoting the unsafe artifact.
3. Apply only versioned, forward-only migrations through the future Beta migration guard. Never repair Beta schema in a dashboard.
4. Verify liveness and readiness while Beta remains inaccessible to students. Do not use the Preview smoke mode against Beta or claim Preview's synthetic-mode proof as Beta isolation evidence.
5. Record the candidate deployment ID, commit SHA, migration list, configuration fingerprint, and prior known-good Beta deployment ID in restricted/sanitized evidence as appropriate.

Deploying a locked Beta candidate is not Beta go-live. Unlock/release remains a protected gate requiring separate named confirmations from Ahmed and Ziad.

## Rollback

1. Lock or keep Beta locked before changing the active deployment.
2. Repoint the Beta deployment target to the recorded prior known-good deployment for its exact commit. Do not rebuild an approximate prior state.
3. Use a forward repair migration when database compatibility requires it; never rewrite an applied migration or restore Preview data into Beta.
4. Re-run liveness/readiness and the applicable authorization/security checks.
5. Append the rollback result and reason to evidence. Preserve the failed deployment, logs, and audit trail unless retention policy requires sanitized disposal.

## Evidence required for WP01-T09

- Separate safe fingerprints and scopes for Preview and Beta.
- Candidate and prior deployment IDs mapped to exact commits.
- Preview six-check smoke result and synthetic/mock-only proof.
- Locked Beta readiness, isolation, promotion, and rollback rehearsal.
- Zero-cost plan/entitlement state, Vercel eligibility checkpoint, and confirmation that no paid plan, trial, add-on, or billable resource was enabled.
- Backup/restore gate state; synthetic provisioning may pass while real-data Beta remains blocked.
- Named human checkpoint; later Beta unlock/go-live evidence separately names both Ahmed and Ziad.
