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

## Changes and results

Filled by WP03-T30 with measured before and after numbers.
