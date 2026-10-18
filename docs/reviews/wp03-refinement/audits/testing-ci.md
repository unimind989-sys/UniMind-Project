# WP03 refinement audit: tests, local verification and CI (cost vs. confidence)

Auditor: Claude Code sub-agent (read-only). Date: 2026-10-18. Main at `bcab083`.
Data: CI runs 39076457286, 39075001940, 39072885508 (main pushes after WP03-T22/T23), the last 100 CI runs, first attempts of 8 re-run runs, job/step timestamps from the Actions API, Playwright and Vitest JSON reports from the run artifacts (downloaded to `.local/wp03-refinement/ci-artifacts/dl-*`), and the in-progress local baseline `.local/wp03-refinement/verify-baseline.tsv`. Nothing was executed locally; no tracked file was changed.

## 0. Headline

- **Wall time (~7.4-8.0 min) is about 81% demo-test execution.** Critical path for run 39076457286: queue 2 s, `ci-selector` 23 s, queue 2 s, `e2e-demo (shard 1)` 434 s (machine prep 45 s, dev-server boot 8 s, 376 s of tests, upload 1 s), queue 2 s, `application` 3 s = 466 s.
- **Compute is ~42.5 min per run.** Demo shards take 31 min (73%), `database-ci` 6.3 min (15%), `e2e` 3.8 min (9%), `static` 1.1 min, `node-tests` 0.5 min, `ci-selector` 0.35 min. Machine prep across all jobs (checkout, setup-node, install, Chromium, upload) is 6.2 min (15%). Chromium is the largest prep item: 8 installs at ~23 s each, 3.1 min.
- **Each demo shard runs one Playwright worker on a 4-vCPU runner.** This is the single largest lever. The `PW_WORKERS` default is 1 and CI does not pass `--workers`, although the README and the config comment both say it does.
- **Reliability costs more than speed.** Since WP03-T16, 9 of ~32 full runs (28%) needed a rerun. Seven were demo flakes: 5 ECONNRESET (fixed by T22), 1 chat layout race (fixed by T23) and 1 quiz-clock race that is **still open**. Two were `ci-selector` failures because `main` moved during the run.
- **Caching would buy little.** pnpm install takes 5-9 s per job, and the browser download is ~11 of the ~23 s Chromium step (the apt `--with-deps` part stays). The CI policy also explicitly forbids any cache (`CACHE_CONFIGURED`).
- **A production-build demo is blocked by a security gate.** `resolveDemoRuntime` enables the loopback demo only when `NODE_ENV === "development"`. Measured dev cold compile is only ~1-2% of demo time, because every product path rewrites to the single `/synthetic-runtime/[...path]` route.
- **Local `pnpm verify` takes ~45-50 min on the founder machine** (4 logical CPUs, the same as the CI runner). The local demo alone is projected at 35-40 min on 1 worker; lint takes 121 s (8-13 s in CI); static checks take 4.3 min serially. The chain also fails when only corepack is on PATH.

## A. Inventory of verification mechanisms

### A.1 Scripts and checks

| Mechanism | Validates | `check` | `verify`/`verify:ci` | CI job | CI time (3 runs) | Local time (baseline) |
| --- | --- | --- | --- | --- | --- | --- |
| `format:check` (`prettier . --check`) | Formatting | yes | yes | static; also ci-selector docs-only path | 6-10 s | 29.0 s |
| `lint` (`eslint . --max-warnings=0`) | Next core-web-vitals and TS rules, `max-lines` (no type-aware rules) | yes | yes | static | 8-13 s | 120.7 s |
| `typecheck` (`tsc --noEmit`, incremental, includes `.next/**/types`) | Strict TS on all `*.ts(x)` | yes | yes | static | 5-9 s | 46.0 s |
| `typecheck:fresh` (`tsconfig.fresh.json`: no `.next` types, no `next-env.d.ts`, non-incremental) | Code does not depend on generated route types | no | yes | static | 5-8 s | 27.0 s |
| `check:boundaries` | Import directions | yes | yes | static | 0-1 s | 2.8 s |
| `check:sql` | SQL conventions over migrations | yes | yes | static | 0-1 s | 2.0 s |
| `verify:ci-workflow` | `ci.yml` policy (`scripts/lib/ci-workflow-policy.ts`) | no | yes | ci-selector **and** static; the same audit also runs in 17 unit tests | 1 s each | 3.9 s |
| `lint:agents` | Agent docs lint and `skills:sync --check` | yes | yes | static; ci-selector docs-only path | 0-1 s | 3.6 s |
| `scan:secrets` | Tracked and untracked non-ignored files (`git ls-files -co`) | yes | yes | static; ci-selector docs-only path | 0-1 s | 22.2 s |
| `test:unit` | Vitest `unit` project | yes | (in `test:node`) | node-tests | — | — |
| `test:node` | Vitest all layers, foundation-evaluation runner, load-profile dry run | no | yes | node-tests | 6-11 s | 44.7 s |
| `test:e2e` | Playwright main suite (`next dev`, real routes, hosted synthetic entry) | no | yes | e2e x2 shards | 54-80 s per shard | 288.7 s (4.8 min) |
| `test:e2e:demo` | Playwright synthetic demo (`pnpm demo 3102` = `next dev` with demo gate) | no | yes | e2e-demo x5 shards | 252-394 s per shard | in progress; projected 35-40 min (1 worker) |
| `test:env-build` | Production `next build` with a safe env (3rd TS pass with typed routes) and client-bundle service-role canary scan | no | yes (last) | static | 13-20 s | pending |
| `pnpm audit --audit-level high --prod` | Known high/critical production vulnerabilities | no | no | dependency-audit (PR only, when dependency paths change) | n/a in sample | n/a |
| `db:ci:*` lifecycle | Start, populated upgrade, reset x2, migrations, pgTAP, advisors, type generation and parity | no | no | database-ci | see B.4 | not runnable (D-21) |
| `test:integration:database` | Vitest `integration` against the disposable stack | no | no | database-ci | 3-4 s | — |
| `test:e2e:database` | Playwright against the disposable stack, `next build` + `next start` | no | no | database-ci | 91-96 s | — |
| `select-ci-jobs.ts` | Path-based job selection | no | no | ci-selector | 1 s | — |

### A.2 Test counts per layer (exact counts from the CI JSON reports of run 39076457286)

| Layer | Files | Tests | Test time | Where |
| --- | --- | --- | --- | --- |
| Vitest unit | 72 | 929 | ~1.7 s summed | check, verify, node-tests |
| Vitest integration | 1 | 2 (**always skipped** in verify/node-tests; real run only in database-ci) | 0 | verify, node-tests, database-ci |
| Vitest security | 5 | 24 | ~0.6 s | verify, node-tests |
| Vitest evaluation | 1 (+ runner script) | 2 (+3 eval cases) | <0.1 s | verify, node-tests |
| Vitest load | 1 (+ dry-run script) | 5 | <0.1 s | verify, node-tests |
| Playwright main e2e | 5 | 39 (`product-shell-contracts` 12, `hosted-synthetic-login` 9, `auth-flows` 9, `landing-experience` 7, `foundation` 2) | 118 s | verify, e2e x2 |
| Playwright demo | 17 | 192 (per file in B.3) | 1,511-1,607 s | verify, e2e-demo x5 |
| Playwright database | 1 | 10 | 31 s (59 s wall) | database-ci |
| pgTAP | 30 SQL files | 533 planned assertions (static `plan(N)` count; output is suppressed in logs) | ~13 s | database-ci |

The largest unit files are `provider-contracts` (114), `study-origin` (89), `admin-actions` (47) and `synthetic-demo-runtime` (45). The slowest are `rls-matrix-contract` (416 ms) and `ci-workflow-policy` (353 ms). Node tests cost almost nothing in CI.

### A.3 Duplicates

| Duplicate | Cost | Verdict |
| --- | --- | --- |
| `verify:ci-workflow` runs in ci-selector, static, and as 17 unit tests in node-tests | ~1 s x 2 + 0.35 s | Keep. The coverage audit counts only application jobs, so removing it from static fails `VERIFY_CI_COMPONENT_MISSING` (TC-17). |
| `pnpm install` in 10 jobs | 82 s compute/run, 7-9 s on the critical path | Inherent to parallel jobs. Caching is policy-forbidden and saves at most ~3 s per job (TC-14). |
| Chromium `--with-deps` in 8 jobs | 183 s compute/run, ~23 s on the critical path | Reduce by ~5 s/job with `--only-shell` (TC-06) and by one job with a single e2e shard (TC-05). |
| Three TypeScript passes in static (`typecheck`, `typecheck:fresh`, `next build`'s "Running TypeScript") | 5-9 s CI, ~46 s local | `typecheck` and `typecheck:fresh` are near-identical on a fresh CI checkout (TC-11). |
| `next build` in static and in database-ci; e2e and demo use `next dev` | — | Not reusable: different `NEXT_PUBLIC_*` values are inlined at build, and a cross-job dependency is needed (TC-16). |
| Local `pnpm verify` re-runs everything that exact-head CI runs | ~45-50 min local per task | Process decision (TC-13). |
| The Vitest `integration` layer in verify/node-tests is 2 always-skipped tests | ~0 s, but prints "2 skipped" in every verify | Cosmetic; leave or document (TC-19). |

## B. Profiling from real CI data

### B.1 Per-job, per-step durations (min-max over the three main runs, seconds)

| Job | Job total | setup+checkout | setup-node | install | Chromium | Test/work steps | Upload |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ci-selector | 18-23 | 3 | 5-6 | 7-8 | — | verify-workflow 1, select 1 | — |
| static | 54-84 | 2-4 | 4-5 | 5-9 | — | format 6-10, lint 8-13, tsc 5-9, tsc fresh 5-8, others 0-1 each, env-build 13-20 | — |
| node-tests | 24-32 | 3-4 | 4-5 | 6-8 | — | 6-11 | 1 |
| e2e (x2) | 104-123 | 2-4 | 5-11 | 6-8 | 22-24 | 54-80 | 1 |
| e2e-demo (x5) | 287-438 | 2-5 | 4-6 | 5-9 | 20-32 | 252-394 | 0-2 |
| database-ci | 374-383 | 3-4 | 5-6 | 7-9 | 22-23 | setup 193-200, pgTAP 12-14, advisors 2, types 3-4, parity 1, integration 3-4, browser 91-96, stop 22-24 | 1-2 |
| application | 3 | — | — | — | — | 0 | — |

Compute per run (sum of job durations): 41.9, 43.0 and 42.8 min. Aggregated over the three runs: test/work 6,447 s, Chromium 550 s, install 247 s, setup-node 171 s, checkout 87 s, upload 27 s, set-up-job 26 s.

Chromium step split (demo shard 1, run 39076457286, 25.4 s): apt update and font/library install (`--with-deps`) ~14 s; Chrome for Testing download and extract (184 MB) 5.4 s; FFmpeg 1.4 s; Chrome Headless Shell 4.4 s. Headless runs use the headless shell: playwright-core picks `headless ? "chromium-headless-shell" : "chromium"`, and no config sets `channel` or `headless: false`.

### B.2 Demo shards

| Run | Per-shard test time (s), shards 1-5 | Total |
| --- | --- | --- |
| 39076457286 | 376 / 257 / 317 / 279 / 283 | 1,511 |
| 39075001940 | 322 / 287 / 316 / 336 / 346 | 1,607 |
| 39072885508 | 384 / 286 / 246 / 337 / 347 | 1,600 |

Shard 1 (both admin files) is the usual long pole, as WP03-T16 predicted. Runner variance is large: the same layout-matrix test takes 47.5 s in one run and 62.4 s in another.

**Dev-server cold compile vs. test logic.** Playwright start to first test (webServer boot plus the `/login` compile) takes 4.4-8.9 s per shard. The first test in shard 1 is only 0.3-1.6 s slower than its other-locale twin (28.7 vs 27.1 s; 20.0 vs 19.7 s; 27.8 vs 27.1 s). Compile overhead is therefore ~10 s per shard, about 50 s of compute and ~10 s of wall per run (~1-2% of demo time). The reason is that every product path rewrites to the single `/synthetic-runtime/[...path]` route, so one compile serves all pages.

**Test-duration distribution** (192 tests): 9-19 tests take 3 s or less, 69-88 take 3-5 s, 51-64 take 5-10 s, 25-27 take 10-20 s, 7-9 take 20-40 s and 3-6 take 40-80 s. The 15 tests over 20 s account for 560 s (34%), and the top 20 for 39% of demo time. Per-test sign-in through login and consent is unavoidable because synthetic state is document-local. The fastest tests (~2.9 s) bound it at ≤2.5 s per test, about 6-8 min of compute per run.

### B.3 Demo cost per spec file (mean of 3 runs)

| File | Tests | Seconds | Share | s/test |
| --- | --- | --- | --- | --- |
| admin.spec.ts | 29 | 211 | 13.4% | 7.3 |
| shelf.layout-matrix.spec.ts | 10 | 170 | 10.8% | 17.0 |
| leader-collection.spec.ts | 22 | 166 | 10.6% | 7.6 |
| leader.layout-matrix.spec.ts | 4 | 137 | 8.7% | 34.3 |
| admin.layout-matrix.spec.ts | 8 | 135 | 8.6% | 16.9 |
| study.layout-matrix.spec.ts | 6 | 127 | 8.1% | 21.2 |
| student-entry.spec.ts | 16 | 110 | 7.0% | 6.9 |
| studio-quiz.spec.ts | 18 | 109 | 6.9% | 6.0 |
| chat.spec.ts | 12 | 88 | 5.6% | 7.3 |
| sources-evidence.spec.ts | 15 | 85 | 5.4% | 5.7 |
| rtl.spec.ts | 19 | 67 | 4.3% | 3.5 |
| settings-account.spec.ts | 14 | 51 | 3.2% | 3.6 |
| public / failure-recovery / auth / chat-history / chat-shared-screens | 5 / 5 / 4 / 3 / 2 | 35 / 30 / 23 / 21 / 7 | 7.3% | — |

The layout matrix (28 tests) is 569 s, or 36% of demo time. Slowest tests (median over runs): leader matrix [en]/[ar] 62 s each; study matrix 51-53 s; shelf route sweep 45-47 s; admin route sweep 34-36 s; admin sections 27-28 s; Studio "five generated formats" 27 s. In the leader matrix, each state's `test.step` takes 2-9 s across both themes. Two steps share the title "a denied fixture (fixture=expired) …" because the name uses only the query string, which makes reports ambiguous (TC-21).

### B.4 database-ci phases (run 39076457286)

`db:ci:start` 96 s (Docker image pulls and health; CLI output suppressed); `upgrade` 35 s; `reset` 32 s and 33 s; `migrations` 2 s. pgTAP 14 s; advisors 2 s; types 4 s; parity 1 s; integration 4 s; Chromium 22 s. Browser step 96 s: ~62 s of seed, `next build` and `next start`, then 34 s for 10 tests. `db:ci:stop` 23 s. The job takes 6.2-6.4 min on every run. **It becomes the critical path as soon as demo shards drop below ~6 min**, on every main push and on PRs that touch frontend, auth, data or storage, which covers most WP03 work.

### B.5 Local `pnpm verify` (founder machine: Windows, 4 logical CPUs, 13.9 GB, local Node v22 vs engines 24.19)

Measured so far: static checks 258 s serially (format 29 s, lint 121 s, typecheck 46 s, fresh 27 s, secrets 22 s, others ~12 s), `test:node` 45 s, `test:e2e` 289 s. The demo was still running at the time of writing: 55 of 192 tests in ~11 min, about 1.35x the CI per-test time. The projection is 35-40 min. Projected total: ~45-50 min. WP03-T22 recorded 36.3 min, and WP03-T15 measured the demo at 23.4 min with `PW_WORKERS=2` (183 tests). Compared with WP03-T15's figure, that implies a 2-worker contention factor of about 1.3 on this 4-CPU machine.

## C. Value assessment

| Category | Regressions it catches | Unique? | Brittleness | Cost/run | Confidence per minute |
| --- | --- | --- | --- | --- | --- |
| Static (format, lint, tsc, boundaries, SQL, secrets, agents, workflow policy) | Type errors, layering violations, SQL convention drift, secrets, CI-policy drift | Yes | None observed | ~1 min compute, off the critical path | Very high |
| `test:env-build` | Build-only failures (typed routes, server/client boundaries, env schema) and service-role leakage into client bundles | **Only production build outside database-ci** | None observed | 13-20 s | Very high |
| Node tests (962) | Domain/application rules, provider contracts, auth proxy, CI policy and selector, RLS-matrix contract | Yes | None observed | 6-11 s | Highest |
| Main e2e (39) | Real login, hosted synthetic entry (the production-reachable synthetic path), HTML/RSC/API privacy, axe and reflow on 5 critical surfaces, landing | Partly overlaps demo screens, but a different composition root (hosted, not loopback) and the only privacy contracts | One local flake in T15 (`auth-flows`), none in CI sample | 3.8 min compute, 2 min wall | High |
| Demo journeys (164) | Core role journeys, RTL, failure recovery, gate isolation (403/404/503 and data-URL probes) | Primary journey coverage of the synthetic client runtime | 7 first-attempt failures in ~32 runs since T16; all traced; 1 still open | ~20 min compute | High, but flake-sensitive |
| Demo layout matrix (28) | Reflow at 1440/390/320 and 200% text, both themes, axe WCAG 2.1 AA, RTL direction, focus, for every prepared state | **Only accessibility, theme and width protection for synthetic screens** | Timing-sensitive (rAF settle); T23 class | ~9.5 min compute; contains the 62 s long poles | High; protected scope, do not drop |
| database-ci | Migrations from empty and populated, idempotent reset, pgTAP RLS/authorization (533 assertions), advisors, type parity, real Auth/RLS browser contracts on a production build | **Only RLS, real-Auth and production-mode browser proof** | Failed only during active T15/T17 development (real defects) | 6.3 min | High; forbidden-path protection |
| dependency-audit | Known high/critical production vulnerabilities | Yes | 1 real failure (38818408948) | PR-only | High |

**Flake history.** In the last 100 runs (2026-09-29 to 10-17): 67 succeeded, 23 failed, 10 were cancelled, and 8 runs needed a second attempt. Since WP03-T16 (~32 full runs), the first-attempt infrastructure or timing failures were:

- 5 x `Failed to proxy … ECONNRESET` in leader-matrix, chat and quiz tests (jobs 117466947735, 117471026422, 117481254354, 117485077993, 117453261880). Fixed by WP03-T22.
- 1 x compact Chat layout race (job 117510750048). Fixed by WP03-T23.
- 1 x `studio-quiz.spec.ts:628` "explicit quiz clock and progress…" (job 117421897741, run 39041524940 attempt 1). `data-workspace-flow` stayed `pane` for 20 s. **Still open** (TC-02).
- 2 x `ci-selector` failures, "Checked-out PR merge commit does not match event base and head", when `main` moved mid-run (39008826792, 39067911066) (TC-03).

The three main runs since T22/T23 are green, which is a small sample.

**Consolidation or rescoping.** No category can be removed without losing forbidden-path, RLS, accessibility, RTL or core-journey protection. The only rescoping candidate is the duplicated theme pass of the layout-matrix *reflow* sweep (TC-18), and that is optional and needs measurement first.

## D. Findings

Classes: Confirmed defect / Missing functionality / UX opportunity (developer experience here) / Technical inefficiency / Subjective design call. Effort: XS (<1 h), S (half day), M (1-2 days).

### TC-01 — Demo shards use one worker on a 4-vCPU runner
- **Class:** Technical inefficiency. **Severity:** High.
- **Evidence:** CI logs show "Running 39 tests using 1 worker, shard 1 of 5". `playwright.demo.config.ts` sets `workers = Number(process.env.PW_WORKERS ?? 1)`, and `ci.yml` sets neither `PW_WORKERS` nor `--workers`. Public-repo `ubuntu-24.04` runners have 4 vCPU and 16 GB. Tests are independent: each signs in on a fresh page against a GET-only server. Parallel safety is already proven locally (T15: 183 tests on 2 workers; T16: 28 matrix tests on 2 workers; T23: `--repeat-each=20` on 4 workers).
- **Recommendation:** Run demo shards with 2 workers and keep 5 shards. Pin it explicitly in the workflow for determinism: add `PW_WORKERS: "2"` to the demo step's `env:`. The policy allows step `env` without secrets, and the shard command string is unchanged, so `E2E_SHARDING_UNSAFE` and `VERIFY_CI_COMPONENT_MISSING` stay clean. Make `PW_WORKERS` parsing fail on NaN.
- **Expected saving** (simulated on the measured per-test durations with Playwright's real contiguous sharding and greedy in-shard dispatch; the simulation reproduces today's 7.0 min critical shard):
  - Critical demo job: **7.0 → 4.4 min** at contention 1.15, or **4.9 min** at the locally measured 1.3 (5.0 min with per-test maxima).
  - Wall: ~7.7 → ~5.2-5.6 min on runs without database-ci, and ~7.7 → ~6.8 min on runs with database-ci, which then becomes the critical path.
  - Compute: demo 31.3 → 19.8-21.9 min, a saving of **9.4-11.5 min/run (22-27%)**.
- **Risk:** CPU contention makes rAF and frame races more likely (the T23 and TC-02 family). Mitigations: fix TC-02 first; before merging, run the demo with `PW_WORKERS=2 --repeat-each=2` on a branch and get two full green PR CI runs; search logs for `Failed to proxy`. Rollback: delete the env line.
- **Effort:** S. This is a protected path (CI workflow): it needs a written plan, independent review and a recorded rollback.

### TC-02 — Open fake-clock race in `studio-quiz.spec.ts`
- **Class:** Confirmed defect (test). **Severity:** High; it is the only known open demo flake.
- **Evidence:** Job 117421897741 failed at `studio-quiz.spec.ts:705`: `data-workspace-flow` was expected `page` but stayed `pane` for 44 polls over 20 s. The test installs a paused fake clock (`page.clock.install` + `pauseAt`). It then changes the viewport (line 678) or root font size (line 701) and calls `page.clock.runFor(64)` once. If the shell's re-measure (a rAF scheduled from the resize or font-size observer) is queued *after* `runFor` returns, the paused fake clock never fires it. This is the same shell behaviour T23 fixed in `chat.spec.ts`, but there the clock is real. It is the only file with this resize-then-`runFor` pattern.
- **Recommendation:** Advance the fake clock until the shell settles instead of once. Wrap the work in `await expect(async () => { await page.clock.runFor(16); await expect(shell).toHaveAttribute("data-workspace-flow", "page", { timeout: 250 }); }).toPass()`. Do the equivalent after each `setViewportSize` at line 678: advance until the flow attribute matches the expected value for that width before measuring. Reproduce it the T23 way first: delay rAF callbacks with an init script to make it fail deterministically, then show it passes.
- **Expected saving:** Removes one known flake. Each flake costs a ~7 min shard rerun plus agent attention. This is a prerequisite for TC-01.
- **Risk:** The assertion must still read settled geometry (T23 decision: do not poll the measured assertions themselves). **Effort:** XS-S. Test-only.

### TC-03 — `ci-selector` turns a moved base into a red required check
- **Class:** Confirmed defect (CI reliability). **Severity:** Medium.
- **Evidence:** Runs 39008826792 and 39067911066 failed with "Checked-out PR merge commit does not match event base and head" in `assertExactPrMergeParents`. That is 2 of ~32 full runs since T16. Because `ci-selector` is a required check (`application`, `dependency-audit`, `database-ci`, `ci-selector`; `strict: false`, no rulesets), every occurrence needs a full rerun: ~8 min wall and ~42 compute-min. It will happen more often as parallel WP03 sessions merge to `main`.
- **Recommendation:** When the checked-out merge commit's second parent equals `PR_HEAD_SHA` and only the first parent differs (the base moved), emit `RUN` for every job, print a notice, and exit 0. Running everything is the safe superset, and each application job tests the newer merge ref anyway. Keep failing closed on a head mismatch or malformed parents. Add selector unit cases for both.
- **Expected saving:** ~6% of runs no longer need a full rerun.
- **Risk:** This changes the WP00-T16 selector semantics and CONTRIBUTING's "a selector failure … blocks merge". It needs an explicit design note and an independent review. **Effort:** S. Protected path.

### TC-04 — README and config claim CI passes `--workers`
- **Class:** Confirmed defect (documentation). **Severity:** Low.
- **Evidence:** `tests/e2e/README.md` ("CI passes `--workers` and `--shard`") and the `playwright.demo.config.ts` comment ("CI passes --workers/--shard") are wrong. `git log -S` shows `--workers` was never in `ci.yml`.
- **Recommendation:** Correct both when TC-01 lands, and state the CPU-based local default (TC-09). **Effort:** XS.

### TC-05 — Main e2e is split into 2 shards that are never on the critical path
- **Class:** Technical inefficiency. **Severity:** Low.
- **Evidence:** The shards take 104-123 s each, of which 54-80 s is tests (47 s + 71 s of test time). Total test time is 118 s, so a single shard runs ~40 s prep + ~6 s boot + ~118 s ≈ 2.7 min. That is still well under the post-TC-01 demo (~4.4-5 min) and database-ci (6.3 min).
- **Recommendation:** Set `matrix.shard: [1]`. The policy accepts a one-element exact matrix, and the command keeps `--shard=1/1`. Keep `workers: 1` for main e2e: its first-hit real-route compiles and 15 s timeouts make parallel compile risky.
- **Expected saving:** ~0.8 compute-min/run and **one fewer concurrent job**. The user account is likely on the Free plan with 20 concurrent jobs; today one run uses 10 at once, so two overlapping runs saturate it. No wall change.
- **Risk:** Negligible; a failure report covers a slightly larger set. **Effort:** XS. Protected path.

### TC-06 — Chromium installs download a browser that headless tests never launch
- **Class:** Technical inefficiency. **Severity:** Low.
- **Evidence:** Each install downloads Chrome for Testing (184 MB, ~5.4 s with extraction) and the headless shell (4.4 s). Headless runs launch `chromium-headless-shell` (playwright-core 1.62), and no config sets `channel` or `headless: false`.
- **Recommendation:** Use `corepack pnpm exec playwright install --with-deps --only-shell chromium` in the e2e and e2e-demo jobs. Their policy check is a substring match (`hasCommand`) plus `safeApplicationRun`, and both accept the suffix. database-ci matches exact strings (`diagnosticCommands`/`allowedRuns`), so either leave it unchanged or update the policy and its test together. Keep `--with-deps`: the apt fonts (FreeFont, IPA, WQY, Unifont) and libraries affect rendering and geometry.
- **Expected saving:** ~5 s on the critical path and ~35-45 s compute/run. **Risk:** Low; a future headed or `channel` run would need the full browser. **Effort:** XS. Protected path.

### TC-07 — database-ci becomes the critical path after TC-01
- **Class:** Technical inefficiency / Subjective design call. **Severity:** Medium (after TC-01).
- **Evidence:** 6.2-6.4 min on every run (B.4). The setup command lines and order are policy-locked (`setupCommands`, two resets). D-21 requires a "complete ephemeral Supabase stack". `supabase/config.toml` enables Studio, edge runtime, analytics (Logflare and Vector), Realtime, local SMTP and the S3 protocol. Most of these have no CI consumer, yet they are pulled and health-checked by `start` and restarted by each `reset`.
- **Recommendation:** Do not change it inside the T29 optimization task. Raise a founder decision: either "complete stack" means the services the product uses (Postgres, Auth, PostgREST, Storage, Kong, Mailpit if Auth emails are asserted), or it stays literal. If the decision allows it, measure `supabase start -x studio,edge-runtime,logflare,vector,imgproxy` on a `workflow_dispatch` with `database_feedback=true` from a branch before proposing it. `tests/unit/ephemeral-supabase.test.ts` pins `["start"]`. Keep `db:ci:stop`: it is WP01-T08 acceptance and policy-required, even though D-21 says the stack is destroyed with the runner.
- **Expected saving:** Unmeasured. The plausible range is 20-60 s of start plus a few seconds per reset, which would directly cut wall time on db runs after TC-01.
- **Risk:** Weakening "complete stack" parity. **Effort:** S plus a decision.

### TC-08 — Local `pnpm verify` and `pnpm check` are serial, fail without `pnpm` on PATH, and run the production build last
- **Class:** Confirmed defect (Windows without `pnpm` on PATH) / Technical inefficiency. **Severity:** Medium.
- **Evidence:**
  - `check` and `verify:ci` chain bare `pnpm X && …`. The memory note "windows-demo-server" records the failure ("'pnpm' is not recognized") when only corepack is on PATH; the baseline script works around it by invoking each step.
  - Static steps take 258 s serially on 4 CPUs.
  - `test:env-build` runs **last**, after ~40 min of browser suites, so a build-only failure appears at the very end.
  - `next build` writes `import "./.next/types/routes.d.ts"` into the tracked `next-env.d.ts`, while the committed form (written by `next dev`) points at `.next/dev/types` (`next/dist/lib/typescript/writeAppTypeDeclarations.js`). A local verify therefore ends with a modified tracked file, which CONTRIBUTING's troubleshooting section works around.
- **Recommendation:** Add `scripts/run-verify.ts` and point `verify` at it. Keep `verify:ci` as the canonical, policy-parsed `pnpm a && pnpm b` list so `auditVerifyCiCoverage` keeps working, and have the orchestrator read that list from `package.json`. The orchestrator:
  1. invokes each component through `process.execPath` + `process.env.npm_execpath`, or `corepack pnpm`, never bare `pnpm`;
  2. runs the cheap static components concurrently, at most 3-4 at a time, with prefixed output and a per-step timing table;
  3. runs `test:env-build` right after the static group and before `test:node`/e2e. This fails fast, and the later `next dev` runs restore the committed `next-env.d.ts`;
  4. stops at the first failure and reports unrun steps honestly.

  Give `check` the same runner (or a `--profile check`).
- **Expected saving:** Static 4.3 → ~2-2.5 min locally (lint is the long pole, see TC-10). A build failure is reported ~40 min earlier. The tree stays clean after verify. CI is unaffected, since CI runs components as separate steps.
- **Risk:** Interleaved output and the orchestrator's own correctness. Exit codes must propagate (no false PASS), and a unit test should assert that the component set equals `verify:ci`. **Effort:** M.

### TC-09 — Local demo default is 1 worker on a 4-CPU machine
- **Class:** Technical inefficiency. **Severity:** High for agent throughput.
- **Evidence:** Projected 35-40 min locally on 1 worker. T15 measured 23.4 min on `PW_WORKERS=2`.
- **Recommendation:** Default `workers` from `os.availableParallelism()`, for example `max(1, floor((cpus - 1) / 1.5))`, which gives 2 on 4 CPUs and 4 on 8. Keep the `PW_WORKERS` override. CI pins its own value (TC-01).
- **Expected saving:** ~12-15 min per local verify. **Risk:** Same timing class as TC-01; on very slow first compiles (memory note: 30-40 s per route on the E: drive), two workers can hit a cold route at once. The single catch-all route and the 300 s test timeout make that tolerable. **Effort:** XS.

### TC-10 — Local lint and format are slow and uncached
- **Class:** Technical inefficiency. **Severity:** Medium (local only).
- **Evidence:** Lint takes 121 s locally vs. 8-13 s in CI, and Prettier 29 s vs. 6-10 s. ESLint 9.39.5 supports `--concurrency auto` and `--cache`. The config has no type-aware rules (no `parserOptions.project`), so a per-file cache is sound. Prettier 3.9.6 supports `--cache`.
- **Recommendation:** Change `lint` to `eslint . --max-warnings=0 --concurrency=auto --cache --cache-strategy content --cache-location node_modules/.cache/eslint/`. Add Prettier `--cache --cache-strategy content` to `format:check`. A fresh CI checkout has no cache, so CI results are unaffected; `--concurrency=auto` may also shave a few seconds in CI.
- **Expected saving:** Warm local runs: lint 121 s → ~10-20 s, format 29 s → ~5 s. Cold lint with 4 threads: ~40-60 s.
- **Risk:**
  - The ESLint cache does not invalidate on plugin upgrades without a config change; clear `node_modules/.cache` after dependency bumps.
  - A Prettier cache can miss Tailwind class-order changes driven by CSS-only theme edits (`prettier-plugin-tailwindcss`).
  - Both risks are local-only; exact-head CI stays authoritative.
- **Effort:** XS. The script names stay the same, so the policy is unaffected.

### TC-11 — Three TypeScript passes in CI static
- **Class:** Technical inefficiency. **Severity:** Low.
- **Evidence:** On a fresh CI checkout, `typecheck` sees no `.next/**/types` and differs from `typecheck:fresh` only by `next-env.d.ts`'s `next` and image-type references, then `next build` runs "Running TypeScript … 8.3 s" with the generated typed routes. Locally, `typecheck` takes 46 s and `typecheck:fresh` 27 s.
- **Recommendation (optional):** Drop plain `typecheck` from `verify:ci` and the static job. Keep it in `check` for the incremental local loop. `typecheck:fresh` proves the fresh checkout, and the build's pass proves typed routes and the `next-env.d.ts` references.
- **Expected saving:** 5-9 s CI (off the critical path) and ~46 s local. **Risk:** If someone later sets `typescript.ignoreBuildErrors`, the typed-route proof disappears silently; a unit assertion on `next.config.ts` would guard it. **Effort:** XS. Protected path (workflow edit and policy test expectation).

### TC-12 — Next.js telemetry is enabled in CI and verify
- **Class:** Technical inefficiency (egress hygiene). **Severity:** Low.
- **Evidence:** The static log prints "Next.js now collects completely anonymous telemetry". `next build` and `next dev` run in 9 jobs per run plus local verify.
- **Recommendation:** Set `NEXT_TELEMETRY_DISABLED=1` in the safe-env spawners (`build-with-safe-env.ts`, `run-synthetic-demo.ts`, the Playwright `webServer.env`, `run-database-playwright-server.ts`). These are not protected paths, unlike workflow-level `env`. **Effort:** XS.

### TC-13 — Local full verify duplicates exact-head CI
- **Class:** Subjective design call. **Severity:** Medium (agent throughput).
- **Evidence:** `docs/agents/workflow.md` §4 says "Run `pnpm verify` once on the finished candidate", which costs ~45-50 min on the founder machine. Exact-head CI then reruns the same suite in ~7.7 min with 5x parallelism and is the merge gate. The runbook already says "Reuse exact-commit CI evidence instead of rerunning overlapping proof."
- **Recommendation:** Founder decision. Option A (recommended): before pushing, run `pnpm check`, `test:env-build`, `test:node`, the main `test:e2e` and the demo specs for the touched area (`--grep @tag` or the spec files), and let exact-head CI run the full demo. Option B: keep the full local verify but adopt TC-08 to TC-10 (~25-30 min).
- **Expected saving:** A saves ~30-40 min of local wall per task; B saves ~15-20 min.
- **Risk:** A pushes more first-attempt failures into CI (free on a public repo, but more concurrency pressure). A demo regression is caught ~5 min later in CI rather than locally. **Effort:** XS (doc), but it changes AGENTS/workflow policy (`skill-authoring` discipline).

### TC-14 — Dependency and browser caching
- **Class:** Subjective design call. **Severity:** Low. **Verdict: do not implement.**
- **Evidence:** The policy forbids caches outright (`hasCacheConfiguration` → `CACHE_CONFIGURED`, with a policy test); WP01-T08's hard stop rules out a credential cache. pnpm install takes 5-9 s per job: a restored store still needs a link step (~3 s) plus a ~3-5 s restore, so the net is ≤3 s per job. On the ordering question: `setup-node` `cache: pnpm` needs pnpm on PATH *before* `setup-node`, but `corepack enable` runs after it and would target the runner's default Node; `actions/cache` on `pnpm store path` avoids that. For browsers, `~/.cache/ms-playwright` would save the ~11 s download, but `install-deps` (~14 s of apt) is still needed, so the net is ~6 s per job.
- **Expected saving:** ≤1.5 compute-min/run (≤3.5%) and ≤10 s wall, in exchange for reversing a deliberate security policy and adding a cross-run cache-poisoning surface (`main`-scope caches are readable by every PR).

### TC-15 — Demo e2e against a production build (`next build` + `next start`)
- **Class:** Subjective design call. **Severity:** Low. **Verdict: reject for now.**
- **Evidence:** `resolveDemoRuntime` returns `ENABLED` only when `NODE_ENV === "development"` (plus a loopback origin, synthetic credentials, mock providers and zero budget). The `/synthetic-runtime/[...path]` page calls `notFound()` otherwise, and the proxy returns 503 for `INVALID`. Making the loopback demo work in a production build means relaxing that gate, which WP03-T15 lists as forbidden: "synthetic runtime or fixtures reachable in production outside the hosted credential flow". `skipProxyUrlNormalize` (WP03-T22) is also read at build time. Measured dev compile cost is only ~10 s per shard (B.2), and a build per shard costs ~15-20 s (static's build takes 13-20 s), so the only possible gain is unmeasured React production-mode render speed.
- **If revisited:** As a separate protected-path task with a founder decision, measured locally first by timing the same 20 tests under dev and prod.

### TC-16 — Reuse static's `next build` via an artifact
- **Class:** Subjective design call. **Verdict: reject.**
- **Evidence:** e2e and demo use `next dev`. database-ci builds with the ephemeral stack's `NEXT_PUBLIC_*` values inlined and must not depend on static: the policy requires `database-ci needs: ci_selector` (`DATABASE_CI_TRIGGER_UNSAFE`), and a dependency would add 1-1.4 min serially.

### TC-17 — `verify:ci-workflow` runs in both ci-selector and static
- **Class:** Technical inefficiency. **Verdict: no change.**
- **Evidence:** About 1 s each. `auditVerifyCiCoverage` counts only application-job runs, so removing it from static fails `VERIFY_CI_COMPONENT_MISSING:verify:ci-workflow`. The selector copy is required by `hasGuardedSelector`.

### TC-18 — The layout matrix sweeps reflow in both colour schemes
- **Class:** Subjective design call. **Severity:** Low.
- **Evidence:** `support/layout-matrix.ts` `sweep()` repeats 3 widths plus the 200% text pass for light *and* dark, then runs axe at desktop in each scheme. The matrix is 569 s (36% of demo time). Reflow is normally scheme-independent; contrast (axe) is not.
- **Recommendation (optional, measure first):** Keep axe in both schemes, but run the width and enlarged-text reflow in one scheme. Alternatively, alternate schemes per locale (en light, ar dark) for the reflow pass. Record per-state step timings with and without the change before deciding.
- **Expected saving:** Estimated 20-30% of matrix time, ~2-3 compute-min/run. **Risk:** Missing a scheme-specific layout difference, such as a different logo asset width in dark mode. This narrows WP03-T15's explicit matrix scope, so it needs owner approval. **Effort:** S.

### TC-19 — The `integration` Vitest layer is always skipped outside database-ci
- **Class:** Subjective design call. **Severity:** Info.
- **Evidence:** `supabase-auth-hosted.test.ts` uses `describe.skip` unless `UNIMIND_DATABASE_AUTH_TEST=true`, so every verify reports "2 skipped". It runs for real in `test:integration:database`.
- **Recommendation:** Optionally leave the `integration` project out of `run-vitest-layer.ts all`, or note it in CONTRIBUTING so "2 skipped" is not read as a gap. No time impact.

### TC-20 — Local verify ends with a modified `next-env.d.ts`
- **Class:** Confirmed defect (local hygiene). **Severity:** Low.
- **Evidence:** See TC-08: `test:env-build` runs last and rewrites the tracked file to the `.next/types` form. **Fix:** Included in TC-08 (run the build before the `next dev` suites).

### TC-21 — Ambiguous matrix step titles
- **Class:** Confirmed defect (reporting). **Severity:** Info.
- **Evidence:** `leader.layout-matrix.spec.ts:327` builds the name from `path.split("?")[1]`, so `/batch-leader/invitation?fixture=expired` and `${campaign}?fixture=expired` both report "a denied fixture (fixture=expired) …". **Fix:** Include the path. **Effort:** XS.

### TC-22 — Reliability needs a pre-merge stress gate for timing-sensitive changes
- **Class:** Missing functionality. **Severity:** Medium.
- **Evidence:** 28% of runs since T16 needed a rerun. Every recent demo flake was a timing race that one green run did not reveal.
- **Recommendation:** For any change that alters worker count, shard layout, shell measurement code or the demo proxy, require one demo run with `--repeat-each=2` (local or a branch CI run) in the task's Verify. Keep `retries: 0`: retries would hide exactly these races and conflict with "no false PASS". **Effort:** XS (doc).

## E. Ranked optimizations

Score = (wall or compute saved × reliability) / complexity. Savings use the measured numbers above.

| Rank | Item | Wall saved/run | Compute saved/run | Reliability | Complexity | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | TC-02 fix quiz fake-clock race | avoids ~7 min reruns | avoids ~7-42 min reruns | + (last known flake) | XS | Prerequisite for 2 |
| 2 | TC-01 demo 2 workers x 5 shards | ~1 min (db runs), ~2.3 min (non-db runs) | 9.4-11.5 min | − unless 1 and TC-22 are done | S (protected) | Biggest CI lever |
| 3 | TC-09 + TC-10 local workers, ESLint concurrency/cache, Prettier cache | local ~14-17 min | — | neutral | XS | No policy impact |
| 4 | TC-03 selector base-moved → run all and succeed | avoids ~8 min reruns (~6% of runs) | avoids ~42 min per occurrence | + | S (protected) | Semantic change; needs review |
| 5 | TC-08 local verify orchestrator | local ~2 min, fail-fast, clean tree | — | + (fixes the bare-`pnpm` failure) | M | Keep `verify:ci` parseable |
| 6 | TC-13 rely on CI for the full demo | local ~30-40 min per task | — | neutral | XS (doc) | Founder decision |
| 7 | TC-05 single e2e shard | 0 | ~0.8 min, −1 concurrent job | neutral | XS (protected) | Bundle with 2 |
| 8 | TC-06 `--only-shell` | ~5 s | ~0.6-0.7 min | neutral | XS (protected) | Bundle with 2 |
| 9 | TC-07 trim Supabase services | 0.3-1 min on db runs (after 2) | same | neutral | S + decision | D-21 wording |
| 10 | TC-11 drop duplicate `typecheck` from `verify:ci` | 0 | ~0.1 min; local ~46 s | neutral | XS (protected) | Optional |
| 11 | TC-12 telemetry off | 0 | ~0 | neutral | XS | Hygiene |
| 12 | TC-18 one-scheme reflow sweep | ~0.2-0.4 min | ~2-3 min | neutral | S + approval | Measure first |
| — | TC-14 caching, TC-15 prod-build demo, TC-16 build reuse, TC-17 drop static workflow check | — | — | — | — | Rejected with reasons |

**Expected end state after items 1, 2, 5, 7 and 8 (one protected T29 PR plus a test-only fix):**
- Wall: ~6.8 min on db runs (database-ci bound) and ~5.2-5.6 min otherwise, down from ~7.4-8.0 min.
- Compute: ~42.5 → ~30-32 min/run.
- Peak concurrent jobs per run: 10 → 9.

**Local verify after items 3, 5 and TC-11:** ~45-50 → ~25-30 min, or ~10-15 min under TC-13 option A.

## F. Constraints any CI change must satisfy (`scripts/lib/ci-workflow-policy.ts`, `tests/unit/ci-workflow-policy.test.ts`)

**Required status checks** (branch protection; `strict: false`, no rulesets): `application`, `dependency-audit`, `database-ci`, `ci-selector`. The names `static`, `node-tests`, `e2e (shard N)` and `e2e-demo (shard N)` are not required, so shard counts can change without a branch-protection edit. The `application` job must keep `needs: [ci_selector, static, node_tests, e2e, e2e_demo]` and its exact gate script.

**Workflow-wide:**
- `permissions: contents: read` only, with no `write` anywhere.
- Every `uses:` is pinned to a 40-hex SHA.
- **No `cache` key or `actions/cache`.**
- No `pull_request_target`.
- `workflow_dispatch` keeps the single boolean `database_feedback` input, defaulting to false.
- Every checkout sets `persist-credentials: false`.

**Application jobs** (static, node_tests, e2e, e2e_demo):
- `needs: ci_selector` and the exact `if` condition.
- Runner `ubuntu-24.04`, timeouts 20/20/30/30.
- Concurrency group contains `${{ github.ref }}` (plus `${{ matrix.shard }}` for sharded jobs), with `cancel-in-progress: true`.
- No `environment`, no secrets, no `continue-on-error`, and no step `if` or `shell` except on `upload-artifact`.
- Every `run` matches `^corepack (enable|pnpm …)$` with no shell operators, or equals the exact sharded command.
- `corepack enable` comes before `corepack pnpm install --frozen-lockfile`.
- e2e and e2e_demo must contain the substring `corepack pnpm exec playwright install --with-deps chromium`.
- Uploads run `if: always()` with path `test-results/`.
- Sharded jobs use `strategy` with exactly `fail-fast: false` and `matrix.shard: [1..N]` (N ≥ 1), and exactly one run equal to `corepack pnpm test:e2e --shard=${{ matrix.shard }}/${{ strategy.job-total }}` or `corepack pnpm test:e2e:demo --fully-parallel --shard=…`.
- Step `env` (for example `PW_WORKERS`) is not restricted beyond the no-secrets rule.

**Coverage:** every `pnpm X` in `package.json` `verify:ci` must appear as `corepack pnpm X` (optionally with the shard suffixes) in an application job, and `verify:ci` must remain `pnpm a && pnpm b …`.

**database-ci:**
- `needs: ci_selector`, the exact `if`, concurrency `database-ci-${{ github.workflow }}-${{ github.ref }}`, timeout 30.
- The `database_setup` step is exactly start, upgrade, reset, reset, migrations.
- Each diagnostic step, including the exact `corepack pnpm exec playwright install --with-deps chromium`, appears once with `if: ${{ always() && steps.database_setup.outcome == 'success' }}`.
- Cleanup `if: always()` `corepack pnpm db:ci:stop`; the upload may include `src/types/database.generated.ts`.

**ci-selector:** name `ci-selector`, timeout 10, `fetch-depth: 0`, the exact outputs, frozen install, `verify:ci-workflow`, the exact select command and env, and the docs-only step containing the prettier, `scan:secrets` and `lint:agents` commands.

**Process:** the CI workflow, selector and policy are protected paths. They need a written plan before editing, an independent review of the exact diff, a recorded rollback, and green exact-head CI. Expect `tests/unit/ci-workflow-policy.test.ts` cases that `replace()` literal workflow text to need updating when that text changes (for example the matrix line, as in WP03-T16).

## G. Suggested sequencing for WP03-T29

1. **Test-only PR, unprotected:** TC-02 (quiz clock race) and TC-21 (step title). Verify with an rAF-delay init-script reproduction before and after, plus `--repeat-each=10`.
2. **Local-only PR:** TC-09, TC-10, TC-12 and TC-04 (docs). Measure local verify before and after against `.local/wp03-refinement/verify-baseline.tsv`.
3. **Protected CI PR:** TC-01 (`PW_WORKERS: "2"` on the demo step), TC-05 (`shard: [1]`), TC-06 (`--only-shell` in e2e and e2e-demo only), and optionally TC-11. Before merging, require two full PR CI runs plus a branch demo run with `--repeat-each=2`; record per-shard times and the zero `Failed to proxy` count. Rollback: revert the squash commit.
4. **Separate PRs or decisions:** TC-03 (selector semantics), TC-08 (orchestrator), TC-13 (workflow policy), TC-07 (D-21 interpretation and measurement), TC-18 (matrix scope).

## H. Method notes and raw data

- Job and step JSON: `.local/wp03-refinement/ci-artifacts/run-*.json`, `jobs/*.json`.
- Logs: `log-demo1-39076457286.txt`, `log-dbci-39076457286.txt`, `log-static-39076457286.txt`, `joblog-<failed job>.txt`.
- Reports: `dl-<run>/…/results.json` and `vitest/all.json`.
- Run list: `runs-100.json`.
- Analysis scripts (not in the repo): session scratchpad `scripts/{jobs,steps,demo,sim,pw}.mjs`.
- The shard simulation uses the median per-test duration over the three runs, Playwright 1.62's `filterForShard` (equal-count contiguous slices in file and declaration order), greedy in-shard dispatch, a fixed 47 s per-shard overhead (prep + dev boot + upload) and a contention multiplier c. It reproduces today's 5 x 1 layout at 7.0 min against the measured 6.1-7.3 min.
- `PWTEST_SHARD_WEIGHTS` exists in Playwright 1.62 (`testActions.js`) but is an internal test hook; do not depend on it.
