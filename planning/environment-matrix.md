# Environment matrix

This matrix records safe environment identities and isolation rules. Full project references, passwords, access tokens, keys, connection strings, private provider correspondence, and backup material stay in approved restricted or ignored stores.

## Approved zero-cost target topology

| Environment | Runtime/data plane | Data classification | Destructive reset | External scope | Owner | Target state |
| --- | --- | --- | --- | --- | --- | --- |
| Workstation development | Next.js process and deterministic in-process mocks; no database service | Synthetic only | N/A | Repository checkout only | Ahmed / Ziad | Available; never shared infrastructure |
| Database/Auth CI | Complete disposable Supabase stack on a GitHub-hosted `ubuntu-24.04` runner | Synthetic only | Yes, inside the disposable runner only | Per-run GitHub Actions job; no persistent Supabase project or long-lived database secret | Ahmed / Ziad; agent executor | External lifecycle passed at `c1428f2`; obsolete GitHub CI settings retirement pending |
| Preview | Existing Supabase Free project currently labeled development, repurposed only after ephemeral CI passes | Synthetic only; mock providers | No development/CI reset command; forward migrations only | Separate Supabase project and separate Vercel Hobby project/scope | Ahmed / Ziad | WP01-T09 repurposing pending |
| Beta | Existing Supabase Free project currently labeled CI, repurposed only after ephemeral CI passes | Empty until backup, rights, security, release, and go-live gates; then rights-approved pilot data only | No development/CI reset command; guarded forward migrations only | Separate Supabase project and separate Vercel Hobby project/scope | Ahmed / Ziad | WP01-T09 repurposing pending; locked |

Preview and Beta must also receive separate storage namespaces, callback bases, queue/worker namespaces, environment secrets, and deployment authority as those adapters are selected. Unassigned future resources are not silently shared.

## Transition state — do not repurpose yet

| Current resource | Safe fingerprint | Region | Current role | Required transition |
| --- | --- | --- | --- | --- |
| Existing Supabase development project | `sha256:5575d1c3d806` | Central EU (Frankfurt), `eu-central-1` | Transitional synthetic hosted development target | After WP01-T08 passes: remove old automation/secrets, rotate credentials, clean and verify synthetic state, relabel and scope as Preview |
| Existing Supabase CI project | `sha256:6ad364ad022a` | West EU (Ireland), `eu-west-1` | Transitional protected hosted CI target | Disposable CI passed; next remove GitHub secrets/environment dependency, rotate credentials, clean and verify empty state, relabel and scope as locked Beta |

Historical WP01-T04/T05/T08 evidence remains valid proof of what those targets did at the recorded commits. It does not prove the revised topology complete. The earlier `$55/month` four-project proposal is superseded, not authorized, and no longer blocks the zero-cost implementation path.

The 2026-08-28 read-only dashboard inventory corrected the historical CI-region label above. The project itself was not moved or changed; the earlier evidence remains accurate for its recorded commands and fingerprints but not for that descriptive region label.

## Approval and eligibility checkpoint — 2026-08-27

- Ahmed approved the zero-cost-first D-21 revision and the two-project topology. Codex `/root` remains the agent executor; Ahmed and Ziad remain shared environment owners.
- Ahmed reports receiving Vercel confirmation that Hobby may be used for the current UniMind phase. The private confirmation was not inspected or committed. Continued use requires the confirmation and provider terms to remain applicable.
- Recheck Vercel eligibility before revenue, payments, advertising, donations, paid contributors, customer work, or another material scope/provider-policy change. Stop deployment if eligibility becomes uncertain.
- No paid plan, trial, payment method, add-on, usage purchase, or billable resource is approved. Future spend requires a separate decision and the protected budget confirmations.
- The repository is public. Standard GitHub-hosted runners are used for the proposed ephemeral CI path; no founder workstation becomes a runner or runtime dependency.
- Supabase Free currently provides the two persistent project slots used by UniMind. Branching and automatic backups are not part of the Free plan, and inactive Free projects may pause.
- Beta remains empty of real data until an approved encrypted backup/restore procedure is implemented and rehearsed, or later paid capacity is explicitly approved. This is a hard blocker for real pilot data and beta go-live, not for synthetic provisioning.
- D-22 governs the shared service identity. Provider account activity does not identify the human actor; task and evidence records name the checkpoint.

Official constraints were rechecked on 2026-08-27: [Supabase pricing](https://supabase.com/pricing), [Supabase CLI local/CI stack](https://supabase.com/docs/guides/local-development/cli/getting-started), [Supabase branching](https://supabase.com/docs/guides/deployment/branching), [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [GitHub runner containers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container), and [Vercel fair-use guidance](https://vercel.com/docs/limits/fair-use-guidelines).

## Existing local health and smoke checkpoint

- `/api/health/live` reports process liveness without entering the Auth proxy or calling an external dependency.
- `/api/health/ready` validates server configuration and returns only `ready` or `not_ready`; it exposes no failing variable name, secret, or topology detail.
- Both routes are uncached and reject unsupported writes with `405`.
- `pnpm smoke:deployment` accepts loopback local targets or remote HTTPS Preview targets, rejects unsafe URLs, and verifies liveness, readiness, write denial, application response, and synthetic/mock-only mode.
- The command passed six checks against a live local Next.js process. External Preview proof remains pending on WP01-T09.

## Isolation rules

- Workstations use mocks. Database/Auth CI uses a disposable runner-local stack. Neither may borrow Preview or Beta credentials.
- The transitional `.local/supabase/development.env` and `.local/supabase/ci.env` profiles remain credentials and must not be committed. The candidate workflow no longer reads them; retire the external GitHub secret/environment settings only after the disposable job passes, and retire workstation profiles during the guarded WP01-T09 repurposing.
- `pnpm verify` remains credential-free, mock-only, and zero paid-provider cost.
- Preview and Beta references are forbidden in destructive development/CI commands and cannot be relabeled to bypass a guard.
- Preview receives synthetic data and mock providers only. Beta remains locked and empty until its protected gates pass.
- Preview and Beta never share a Supabase project, Vercel project scope, secrets, callbacks, storage namespace, queue/worker namespace, or deployment authority.
- Migrations and seed data remain versioned. Preview/Beta schema repair is forward-only; dashboard-only repair is prohibited.
