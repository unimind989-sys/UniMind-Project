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

**Files:** `next.config.ts`, `src/proxy.ts` (comment only), a unit test for the config, this record, the runbook.

**Protected paths:** production configuration (`next.config.ts`) and the request gate (`src/proxy.ts`). Allowed: `skipProxyUrlNormalize` is on only when `UNIMIND_SYNTHETIC_DEMO === "true"`, and the demo rewrite resolves internally. Forbidden, proved: the option is off for every other environment (real runtime and production builds); a demo `POST` still gets 403; a non-allow-listed demo path still gets 404; demo responses keep `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`; real mode still answers 404 for `/synthetic-runtime/...`.

**Verify:** local `corepack pnpm demo 3140` with a temporary proxy log (one proxy call per request, no second `localhost` hop); curl probes for the 403, 404 and headers; `pnpm check`; `pnpm verify`; PR CI twice with the dev-server log searched for `Failed to proxy`.

**Pass:** one proxy invocation per demo request, required CI green on two full runs, zero `Failed to proxy` lines.

**Rollback:** revert the squash commit. The demo then proxies over HTTP again (the previous, flaky but functional behaviour); real mode is unaffected either way.

**Hard stop:** any change to real-mode proxy behaviour or production build output; any weakening of the demo gate; any paid action.

## Steps

- [x] Diagnose. Next's proxy adapter (`next/dist/server/web/adapter.js`) re-parses every rewrite target with `NextURL`, which renames `127.0.0.1` to `localhost`, then writes it back to `x-middleware-rewrite`. The router compares that target with its own base URL, built from `--hostname 127.0.0.1`; the origins differ, so it treats the rewrite as external and proxies it over HTTP (`proxy-request.js`, `proxyTimeout` 30 s). `request.url` is `nextUrl.toString()` in Next 16, so WP03-T15's switch to `request.url` never helped. Local proof: one `/login` request ran the proxy twice, the second time for `/synthetic-runtime/login` with `Host: localhost:3140`.
- [ ] Turn on `skipProxyUrlNormalize` only for the synthetic demo, so Next sends the rewrite target as written (`http://127.0.0.1:<port>/synthetic-runtime/...`), which matches the router's origin and stays internal. Fix the stale `request.url` comment in `src/proxy.ts`. The gate logic is unchanged.
- [ ] Unit-test that the config enables the option only for the demo environment.
- [ ] Verify locally (single proxy call, gate probes, a demo e2e subset), then `pnpm check` and `pnpm verify`.
- [ ] Independent review of the exact diff; PR; two full CI runs with no `Failed to proxy`; merge; close.

## Decisions

- Chose Next's documented `skipProxyUrlNormalize` over raising `experimental.proxyTimeout`: a longer timeout keeps the extra HTTP hop and a second proxy pass, and only moves the failure threshold. Scoped to the demo so real-mode proxy input (`request.url`, `_rsc`, flight headers) stays normalized.

## Current state

**Changed:** runbook entry and this record; implementation NOT STARTED.

**Proof:** diagnosis reproduced locally on port 3140 (see Steps).

**Review:** PENDING.

**Approved commit:** NOT REQUIRED: no visible UI change.

**Remaining:** implementation, verification, review, delivery.

## Next action

Add the demo-scoped `skipProxyUrlNormalize` to `next.config.ts` and confirm a single proxy pass locally.
