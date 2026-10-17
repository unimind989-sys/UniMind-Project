# Task record: WP03-T22 keep the loopback demo rewrite internal

**Task ID:** WP03-T22

**Status:** [~]

**Outcome:** Loopback demo requests are rewritten to `/synthetic-runtime/...` inside the same Next server, so no demo render goes through Next's 30-second HTTP proxy.

**Acceptance:** [runbook WP03-T22](../../docs/runbooks/poc-execution-runbook.md#wp03-t22--keep-the-loopback-demo-rewrite-internal)

**Owner:** Claude Code (side session started by the WP03 overseeing session under Ahmed's delegation); selected speaker Ahmed

**Branch:** claude/wp03-t22-internal-demo-rewrite

**Updated (UTC):** 2026-10-17T20:30:00Z

## Contract

**Dependencies:** WP03-T15 (loopback demo gate), main `b8f5647`.

**Inputs:** failing CI runs 39052308488 (main, shard 3), 39056989253 (PR #83, shard 2), 39058364853 (PR #83, shard 5); Next 16.3.8 sources and `node_modules/next/dist/docs/`.

**Files:** `next.config.ts`, `src/proxy.ts` (comment only), `tests/unit/synthetic-demo-runtime.test.ts`, `tests/e2e/support/session.ts` (sign-in guard), this record, the runbook.

**Protected paths:** production configuration (`next.config.ts`) and the request gate (`src/proxy.ts`). Allowed: `skipProxyUrlNormalize` is on only when `UNIMIND_SYNTHETIC_DEMO === "true"`, and the demo rewrite resolves internally. Forbidden, proved: the option is off for every other environment (real runtime and production builds); a demo `POST` still gets 403; a non-allow-listed demo path still gets 404; demo responses keep `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`; real mode still answers 404 for `/synthetic-runtime/...`.

**Verify:** local `corepack pnpm demo 3140` with a temporary proxy log (one proxy call per request, no second `localhost` hop); curl probes for the 403, 404 and headers; `pnpm check`; `pnpm verify`; PR CI twice with the dev-server log searched for `Failed to proxy`.

**Pass:** one proxy invocation per demo request, required CI green on two full runs, zero `Failed to proxy` lines.

**Rollback:** revert the squash commit. The demo then proxies over HTTP again (the previous, flaky but functional behaviour); real mode is unaffected either way.

**Hard stop:** any change to real-mode proxy behaviour or production build output; any weakening of the demo gate; any paid action.

## Steps

- [x] Diagnose. Next's proxy adapter (`next/dist/server/web/adapter.js`) re-parses every rewrite target with `NextURL`, which renames `127.0.0.1` to `localhost`, then writes it back to `x-middleware-rewrite`. The router compares that target with its own base URL, built from `--hostname 127.0.0.1`; the origins differ, so it treats the rewrite as external and proxies it to itself over HTTP (`proxy-request.js`). `request.url` is `nextUrl.toString()` in Next 16, so WP03-T15's switch to `request.url` never helped. Local proof: one `/login` request ran the proxy twice, the second time for `/synthetic-runtime/login` with `Host: localhost:3140`.
- [x] Failure mode. Not the 30 s proxy timeout: in all three failing CI jobs the reset is logged 50 to 80 ms after the failing test's sign-in starts, and each time the previous test took exactly 6.0 s. Next's self-proxy reuses a pooled keep-alive socket (httpxy on Node 24's default agent) that the dev server closes after about 5 s idle (`Keep-Alive: timeout=5`), so a request sent at that moment gets `ECONNRESET`. An internal rewrite has no self-proxy, so it removes both this race and the timeout exposure.
- [x] WP03-T19 did not make renders materially slower: total demo test time 1,549 s on run 39042682896 (T18) against 1,572 s on 39052308488 (T19), and 1,050 → 1,073 s over the 141 identically named tests; tests lasting 5.5 to 6.5 s went 19 → 17. The largest increases are the leader layout matrix [ar] (+11 s) and the public axe pages (+3 s each). No `Failed to proxy` line appeared in six pre-T19 runs and one did in three of six runs since; with no slowdown to explain it, the race window (idle time near the 5 s keep-alive limit) is timing luck that T19's changed test timings happened to hit.
- [x] Turn on `skipProxyUrlNormalize` only for the synthetic demo, so Next sends the rewrite target as written (`http://127.0.0.1:<port>/synthetic-runtime/...`), which matches the router's origin and stays internal. Fix the stale `request.url` comment in `src/proxy.ts`. The gate logic is unchanged.
- [x] Unit-test the config scoping and the rewrite origin; assert in `signIn` that every demo sign-in rewrite is relative, so a regression fails every demo test instead of flaking.
- [x] Verify locally (single proxy call, gate probes, a demo e2e subset), then `pnpm check`.
- [ ] Independent review of the exact diff; PR; two full CI runs with no `Failed to proxy`; merge; close.

## Decisions

- Chose Next's documented `skipProxyUrlNormalize` over raising `experimental.proxyTimeout`: the failures are keep-alive resets, not timeouts, so a longer timeout would not fix them, and it keeps the extra HTTP hop and second proxy pass. Scoped to the demo (key absent otherwise) so real-mode proxy input (`request.url`, `_rsc`, flight headers) and production build output stay unchanged.
- Kept the gate's `localhost:<port>` Host allowance. It only served the self-proxy hop this task removes; tightening it is a separate hardening, not needed here.

## Current state

**Changed:** `next.config.ts` adds `skipProxyUrlNormalize: true` only when `UNIMIND_SYNTHETIC_DEMO === "true"`; `src/proxy.ts` comment corrected (no logic change); `tests/unit/synthetic-demo-runtime.test.ts` covers the config for unset, `false` and `true`, plus the rewrite origin and gate headers; `tests/e2e/support/session.ts` asserts a relative `/synthetic-runtime/login?` rewrite on every demo sign-in.

**Proof:** local demo on 3140 before → proxy ran twice per `/login`, `x-middleware-rewrite: http://localhost:3140/synthetic-runtime/login?lang=en`; after → once, `x-middleware-rewrite: /synthetic-runtime/login?lang=en`. Gate probes after: `POST /login`, `GET /api/health/live` and `next-action` → 403; `/not-a-product-path` → 404; foreign Host → 503; asset → `private, no-store` and `noindex, nofollow`; pages → `noindex, nofollow` and the same `no-cache, must-revalidate` that Next dev set before the change (baseline captured on the old config). The new unit test fails on the old config. Demo e2e locally: the three CI failures plus `auth.spec.ts` → 12 passed, no `Failed to proxy`; the sign-in guard passes with the fix and fails on the old config with the absolute `localhost` target. `pnpm check` → green (921 unit tests). `pnpm verify` and the two full CI runs: PENDING.

**Review:** PENDING.

**Approved commit:** NOT REQUIRED: no visible UI change.

**Remaining:** independent review, `pnpm verify`, PR, two full CI runs, merge, closure.

## Next action

Run the independent review of `b8f5647..HEAD`, then open the PR.
