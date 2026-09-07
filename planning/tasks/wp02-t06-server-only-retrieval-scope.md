# Task record: WP02-T06 server-only retrieval scope

**Task ID:** WP02-T06

**Status:** [x]

**Outcome:** One private server-only hybrid retrieval function binds every request to an authoritative user/cohort/unit/source scope before vector or full-text candidate ranking, while unrestricted segments and vectors remain unavailable to clients.

**Owner:** Codex `/root`; Ahmed is the named requester in this chat

**Reviewer:** Ahmed for the ordinary WP02-T06 checkpoint; Ahmed + Ziad for the included protected RLS repair

**Branch:** `wp02/server-only-retrieval-scope`

**Updated (UTC):** 2026-09-07T20:21:31Z

## Execution contract

**Dependencies:** WP02-T05 implementation/evidence at `59ce324b9648ffa1876b924238bfc78167b8ce0a` remains valid. The 2026-09-07 audit found that the earlier T04 direct catalog policies did not match the authoritative release-visibility contract, so a CLI-generated forward RLS repair is included and reopens the protected T04 checkpoint. D-04 remains open; only the deterministic synthetic embedding configuration is permitted.

**Inputs:** Runbook WP02-T06 and sections 5.8-5.10; master-plan sections 8.2, 8.4, and 8.6; ADR-0002; existing private segment/vector tables, authorization functions, explicit grants, synthetic fixture, and pgTAP/security harness.

**Files:** CLI-generated forward migrations `20260907123954_restrict_student_release_metadata.sql` and `20260907124502_harden_server_only_retrieval_scope.sql`; focused pgTAP files `14_availability_retrieval_functions.sql`, `17_actor_action_resource_matrix.sql`, and `19_server_only_retrieval_scope.sql`; credential-free retrieval contract test; RLS matrix; migration/runbook/task documentation; sanitized evidence under `evidence/wp02-database/`.

**Verify:** `corepack pnpm check:sql`; focused `corepack pnpm test:security -- retrieval-scope-contract.test.ts`; complete `corepack pnpm test:security`; `corepack pnpm test:integration`; `corepack pnpm verify`; disposable `db:ci:upgrade`, two `db:ci:reset` runs, `db:ci:migrations`, all pgTAP tests, advisors, generated types/parity, and database Auth integration on GitHub-hosted CI; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** Authenticated clients have neither table access nor function execution; the service role alone invokes the narrow vector/text interface; every call validates the active config and authoritative caller access; cohort/unit/release/source/rights/edition/segment filters precede both candidate limits; the synthetic HNSW operator class matches the direct cosine distance order; cross-unit, cross-cohort, cross-program, inactive-segment, revoked-source, inactive-config, invalid-vector/text/limit, and forged-user cases fail closed; student direct catalog reads expose no locked release reason or premature unit.

**Evidence:** `evidence/wp02-database/2026-09-07_server-only-retrieval-scope_github_12b50cd.md`; green GitHub run `34158635066` and the exact protected implementation candidate `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7` are frozen there.

**Rollback:** Never rewrite applied migrations. Before promotion, revert the unshared forward migrations and dependent tests/docs. After promotion, disable the retrieval consumer and apply a new reviewed forward repair; never reset Preview/Beta or migrate a shared database backward.

**Hard stop:** Do not push/open a PR without Ahmed's explicit publication authorization. Do not merge or promote the RLS repair without separate exact-candidate confirmations from Ahmed and Ziad. Do not deploy, reset Preview/Beta, activate a real embedding config, create a production HNSW index, use credentials/private data, call paid providers, publish/unlock content, or start WP02-T07 until all technical and protected gates close.

## Steps

- [x] Audit inherited table policies, grants, authorization functions, retrieval code, fixtures, and prior evidence; record the direct release-metadata defect.
- [x] Add a CLI-generated forward RLS repair and correct the student boundary expectations/matrix language.
- [x] Replace the vector-only function with a private vector/text hybrid seam, exact authoritative filters, reciprocal-rank fusion output, and fail-closed config validation.
- [x] Add the config-specific three-dimensional cosine HNSW index and full-text GIN index for the only approved synthetic configuration.
- [x] Add credential-free contracts plus pgTAP coverage for direct grants, function shape, invalid inputs/state, immediate revocation, and same-program/cross-program canaries.
- [x] Execute the complete disposable database and repository gates; correct any failures and record exact results. Green run `34158635066` passed after two review-driven correction rounds.
- [x] Freeze the exact candidate, obtain Ahmed + Ziad confirmations for the RLS repair, and create the sanitized gate evidence without promoting shared state. Ahmed confirmed the PR and separately relayed Ziad's named confirmation under D-22; the unchanged protected implementation candidate is `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7`.

## Handoff

**Changed:** PR `#19` contains the forward release-visibility repair, server-only hybrid retrieval seam, config-specific synthetic HNSW and full-text indexes, and isolation/grant/state tests. No shared Supabase database, production deployment, real embedding configuration, or provider was changed.

**Commands:** Local `corepack pnpm verify` passed. GitHub run `34158635066` passed dependency audit, the complete application gate, populated database upgrade, two clean resets, 20-migration parity, 271 pgTAP assertions, advisors, generated types/parity, database Auth integration, cleanup, and sanitized artifact upload. Readiness and isolated handoff rehearsals also pass. Hosted dry-run remains intentionally unavailable because the ignored workstation Supabase profile is absent; GitHub disposable CI supplied the authoritative database proof.

**Remaining:** No WP02-T06 technical or protected gate remains. Merge/branch/deployment cleanup is an authorized delivery operation, not unfinished task behavior. The separately confirmed Vercel cleanup removed and verified absence of the August 31 automation bypass and retained `5aaaf51` deployment without touching current Production or Beta.

**Next safe action:** Merge the unchanged green PR through protected `main`, verify main CI, remove temporary branch/preview state, and select WP02-T07.

**Reviewer action:** Completed for this gate. Ahmed confirmed the final PR scope and relayed Ziad's separate named confirmation as allowed by D-22. Shared Supabase promotion remains outside this task and was not performed.
