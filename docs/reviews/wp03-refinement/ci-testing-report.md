# WP03 refinement: CI and testing report

**Tasks:** baseline in [WP03-T24](../../runbooks/poc-execution-runbook.md#wp03-t24--audit-the-platform-and-plan-the-wp03-refinement); changes in [WP03-T30](../../runbooks/poc-execution-runbook.md#wp03-t30--speed-up-local-verification-and-ci-without-losing-coverage). **Evidence:** the [tests and CI audit](audits/testing-ci.md) holds the full inventory, per-step profile, value assessment and every finding (TC-01 to TC-22).

## Inventory in brief

| Mechanism | What it protects | Where it runs |
| --- | --- | --- |
| Format, lint, `typecheck`, `typecheck:fresh`, module boundaries, SQL conventions, workflow policy, agent docs, secret scan | Style, types, layering, migration conventions, CI hardening, secrets | `check` (most), `verify`, CI `static` |
| `test:node` (Vitest unit 929, security 24, evaluation 2, load 5, integration 2 skipped outside the database job) | Domain and application rules, provider contracts, auth proxy, CI policy and selector, RLS matrix contract | `verify`, CI `node-tests` |
| `test:e2e` (39 Playwright tests) | Real login, hosted synthetic entry, HTML/RSC/API privacy, axe and reflow on five critical surfaces, landing | `verify`, CI `e2e` |
| `test:e2e:demo` (192 Playwright tests, 28 of them the layout matrix) | Every role journey in the synthetic client runtime, RTL, failure recovery, demo-gate isolation; the only accessibility, theme and width sweep of synthetic screens | `verify`, CI `e2e-demo` |
| `test:env-build` | Production build, typed routes, client-bundle secret canary | `verify`, CI `static` |
| `database-ci` (pgTAP 533 assertions, advisors, type parity, DB integration, 10 real-Auth browser tests) | RLS, authorization and real Auth on a disposable Supabase stack | CI only |
| `dependency-audit` | Known high or critical production vulnerabilities | CI, pull requests that touch dependencies |

No category could be removed without losing forbidden-path, RLS, accessibility, RTL or core-journey protection (audit section C).

## Baseline (before WP03-T30)

### CI (three `main` pushes after WP03-T22 and T23)

| Measure | Value |
| --- | --- |
| Wall time | 7.4 to 8.0 min (runs 39076457286, 39075001940, 39072885508) |
| Critical path | `ci-selector` 23 s, then the slowest demo shard (up to 7.2 min) |
| Compute per run | 41.9, 43.0 and 42.8 min |
| Demo shards | 5 shards, 1 Playwright worker each on 4-vCPU runners; 31 compute-min (73%) |
| `database-ci` | 6.2 to 6.4 min every run |
| Main e2e | 2 shards of 1.7 to 2.0 min |
| Machine preparation | 6.2 compute-min per run; Chromium with system deps installed 8 times (about 23 s each) |
| Reliability | 9 of about 32 full runs since WP03-T16 needed a rerun: 5 proxy resets (fixed by T22), 1 chat layout race (fixed by T23), 1 open quiz-clock race, 2 selector failures when `main` moved mid-run |

### Local `pnpm verify` (founder machine: Windows, 4 logical CPUs, run one step at a time)

| Step | Time |
| --- | --- |
| `format:check` | 29.0 s |
| `lint` | 120.7 s |
| `typecheck` | 46.0 s |
| `typecheck:fresh` | 27.0 s |
| `check:boundaries`, `check:sql`, `verify:ci-workflow`, `lint:agents` | 12.4 s together |
| `scan:secrets` | 22.2 s |
| `test:node` | 44.7 s |
| `test:e2e` | 288.7 s |
| `test:e2e:demo` | 2,196.8 s (36.6 min, 192 passed, 1 worker) |
| `test:env-build` | 117.7 s |
| **Total** | **2,905.7 s (48.4 min), every step passed** |

The chain also fails outright when `pnpm` itself is not on PATH (only corepack), builds last (a build error shows up after the browser suites), and leaves `next-env.d.ts` modified.

## Changes and results (WP03-T30)

### What changed

| Finding | Change | Why it is safe |
| --- | --- | --- |
| TC-02 | The quiz journey waits for the real resize event or a resize-observer delivery before it advances its paused fake clock | With observer callbacks deliberately delayed, the old one-shot advance failed 3/3 and the new helper passed 3/3; the real journey passed 10/10 |
| TC-01 | Two Playwright workers per demo shard (five shards kept) | Every demo test signs in on its own page; a full local demo `--repeat-each=2` on two workers passed |
| TC-05 | One main e2e shard instead of two | Its 118 s of tests were never on the critical path; one fewer concurrent job |
| TC-06 | e2e and e2e-demo install only the Chromium headless shell | Headless runs launch the shell; `--with-deps` keeps fonts and libraries; database-ci unchanged |
| TC-11 | No plain `typecheck` in `verify:ci` or the static job (kept in `pnpm check`) | `typecheck:fresh` covers every tracked file and the production build type-checks app code; a unit test pins `ignoreBuildErrors: false` |
| TC-03 | The selector runs every job when only the PR base moved | Running everything is a superset; a different head or malformed commit still fails closed |
| TC-08, TC-20 | `pnpm verify` and `pnpm check` run through `scripts/run-verify.ts`: static checks in parallel, the build before the browser suites, no bare `pnpm`, a timing table, no leftover `next-env.d.ts` change | It runs exactly the `verify:ci` components (unit-tested) and stops at the first failure |
| TC-09, TC-10, TC-12 | CPU-based local demo workers, ESLint and Prettier content caches, Next telemetry off | Local only; CI has no cache |
| TC-04, TC-21, TC-22 | Corrected docs, unique matrix step titles, the `--repeat-each=2` rule for timing-sensitive changes | Documentation and reporting |

Not changed, with reasons in the audit: caching (forbidden by the CI policy, under 1.5 compute-minutes), a production-build demo (weakens the T15 demo gate for a 1 to 2% gain), cross-job build reuse, removing the selector's duplicate workflow check, narrowing the layout matrix, trimming the database stack (needs a reading of D-21).

### CI before and after

| Measure | Before (main pushes 39076457286, 39075001940, 39072885508) | After (PR runs 39083623872, 39085439849) |
| --- | --- | --- |
| Wall time | 7.4 to 8.0 min | 6.75 to 6.95 min, now bound by `database-ci` (6.4 to 6.5 min) |
| Application gate complete (all non-database jobs) | 7.3 to 7.9 min | 4.65 to 5.05 min |
| Slowest demo shard | 6.1 to 7.2 min | 4.2 to 4.5 min |
| Demo shards | 4.8 to 7.2 min each, 1 worker | 3.4 to 4.5 min each, 2 workers |
| Main e2e | 2 shards of 1.7 to 2.0 min | 1 shard of 2.6 to 2.75 min |
| Compute per run | 41.9 to 43.0 min | 30.7 to 31.9 min (about 26% less; the PR runs also include the 14 s dependency audit) |
| Concurrent jobs per run | 10 | 9 |
| Tests run | 192 demo, 39 main e2e, Node layers, database-ci | Same |

A pull request that does not touch database, auth or storage paths skips `database-ci`, so its wall time now ends with the application gate, at about 5 minutes instead of about 7.5.

### Local `pnpm verify` before and after

| Run | Time | Conditions |
| --- | --- | --- |
| Before: one step at a time (`bcab083`) | 48.4 min | Five read-only audit agents running |
| After: `scripts/run-verify.ts` on the WP03-T30 candidate | 34.0 min (every step passed; demo 192 in 27.3 min on 2 workers) | Another task building and testing on the same 4-CPU machine at the same time |

Step detail for the after run: format 18.5 s, lint 34.5 s, `typecheck:fresh` 40.5 s, secret scan 34.1 s and the four small checks ran together in about 41 s instead of about 245 s in sequence; the production build moved first (56.2 s); Node tests 32.5 s; main e2e 244.3 s; demo 1,643.2 s. A clean re-measure on a quiet machine follows below.

## After the refinement (merged `main`)

Measured after WP03-T25 to T30 merged, for the [final verification](final-verification.md). The suites grew during the refinement: demo tests went from 192 to 209, main e2e from 39 to 44, and the Node layers from 960 to 1,080 passing. `database-ci` also gained pgTAP 30 and new database e2e journeys (welcome, leader suspension and missing profile, the new-device language path, pending Sign out and New session).

### CI on `main` pushes

| Run | Commit | Wall | Application gate (all non-database jobs) | Slowest demo shard | Main e2e | `database-ci` | Compute |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before: 39076457286, 39075001940, 39072885508 | `bcab083`, `ed4f83b`, `848104f` | 7.35 to 8.0 min | 7.25 to 7.9 min | 6.85 to 7.3 min | 1.9 to 2.0 min (2 shards) | 6.2 to 6.4 min | 41.9 to 43.1 min |
| 39088319029 | `8abc0ac` (T30) | 6.25 min | 4.6 min | 4.2 min | 2.7 min | 5.9 min | 28.6 min |
| 39094816887 | `2ca8e1d` (T25) | 6.65 min | 4.75 min | 4.3 min | 2.65 min | 6.25 min | 30.0 min |
| 39098462032 | `4373a41` (T27) | 7.1 min | 4.95 min | 4.55 min | 2.5 min | 6.7 min | 31.0 min |
| 39104211964 | `c9f013c` (T28) | 7.35 min | 4.7 min | 4.3 min | 2.4 min | 7.0 min | 30.9 min |
| 39115858531 | `ee73e9b` (T26) | 7.0 min | 4.9 min | 4.55 min | 2.95 min | 6.6 min | 32.0 min |
| 39123365373 | `529296c` (T29) | 6.85 min | 5.05 min | 4.65 min | 2.95 min | 6.4 min | 32.3 min |

- **Application gate:** every non-database job now finishes about 2.5 to 3 minutes sooner (about 5 min instead of 7.3 to 7.9), even with 17 more demo tests.
- **`main` wall time:** `database-ci` (6.4 to 7.0 min) now sets it, because WP03-T27 and T28 added database tests. The wall time on `main` still fell, from 7.4 to 8.0 min to 6.85 to 7.35 min.
- **Pull requests:** a PR that does not select `database-ci` ends with the application gate, at about 5 minutes.
- **Compute:** 28.6 to 32.3 min per run instead of 41.9 to 43.1, about 25% less, for a larger suite.

### Local `pnpm verify` on merged `main`

| Run | Time | Conditions |
| --- | --- | --- |
| Before: one step at a time (`bcab083`) | 48.4 min (2,905.7 s) | Five read-only audit agents running |
| WP03-T30 candidate | 34.0 min | Another task building and testing on the same machine |
| Merged `main` at `529296c` | **31.0 min (1,861.6 s)**, every step passed | Quiet machine: no other build, test or agent running (4 logical CPUs) |

Step detail for the `529296c` run. The static checks ran in parallel:
- format: 49.3 s
- lint: 85.2 s
- `typecheck:fresh`: 58.1 s
- secret scan: 54.0 s
- agent lint: 9.0 s
- three small checks: about 2 s each

The rest ran after them:
- production build with the client secret scan: 57.7 s
- Node layers: 32.0 s (1,080 passed, 2 skipped)
- main e2e: 228.0 s (44 passed, 1 worker)
- demo: 1,431.6 s (209 passed, 2 workers)

The demo suite is about 77% of the total. It is the remaining lever, and the plan keeps it whole (TC-13 to TC-15).
