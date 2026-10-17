# Task record: WP03-T20 rebuild the landing and access pages in Cobalt

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T20

**Status:** [~]

**Outcome:** The public landing opens on the approved L1 hero ("The page answers") and the sign-in, registration, verification, consent and recovery pages render in the Cobalt direction, with every behaviour unchanged.

**Acceptance:** [WP03-T20](../../docs/runbooks/poc-execution-runbook.md#wp03-t20--rebuild-the-landing-and-access-pages-in-the-approved-direction)

**Owner:** Claude Code (overseeing session); Ahmed delegated approval

**Branch:** claude/wp03-t20-landing-access-cobalt

**Updated (UTC):** 2026-10-17T21:50Z

## Contract

**Dependencies:** WP03-T19 delivered (`4849cf0`, PR #82).

**Inputs:** `DESIGN.md` "Public landing" (L1); `planning/design/premium-overhaul/landing.html` screens L1 and L1 phone; the content pack in `planning/design/premium-overhaul/README.md`; the Cobalt tokens, top bar and kit from WP03-T19.

**Files:** `src/app/_components/landing*.{tsx,module.css}`, `src/app/layout.tsx` (handout face only), `src/app/(auth)/**` presentation (`auth.module.css`, `auth-shell.tsx`, `auth-page.tsx`), `src/app/_components/product-auth.tsx` markup, affected tests.

**Protected paths:** auth and consent routes. Allowed: CSS, markup and class names. Forbidden: Server Actions (`actions.ts`), redirects, cookies, validation, messages, rights and consent text, hosted-synthetic rules. Independent review of the final diff is required.

**Verify:** `corepack pnpm` parts of `check`; `test:unit`; demo e2e (public, auth, rtl, landing, layout matrices); real e2e `auth-flows`, `hosted-synthetic-login`, `landing-experience`; rendered review at 1440, 820, 390 and 320px (200% text), light and dark, EN and AR, reduced motion.

**Pass:** the L1 hero and recomposed lower sections match `DESIGN.md`; access pages use the Night brand plane and white form surface; auth behaviour unchanged (independent review); tests changed only where they pinned old presentation; required CI green; overseer approval recorded.

**Rollback:** revert the PR; no data, schema or configuration change.

**Hard stop:** any auth, consent or rights logic change; new runtime dependency (next/font faces are fine); paid service.

## Steps

- [x] L1 hero: Night stage, slogan, lede, actions, proof lines, handout, bubble, answer card, professor note, the 3.5 s moment with Replay and reduced motion.
- [x] Lower sections recomposed in Cobalt with the content pack.
- [x] Access pages: Night brand plane and white form surface.
- [ ] Tests updated where they pinned old presentation; local verification.
- [ ] Independent review, PR, required CI, overseer approval, merge, production proof.

## Decisions

- 2026-10-17, Ahmed: delegated approval and end-to-end responsibility for WP03-T18 to T21 to the overseeing session while he is away. Approvals here are the overseer's under that delegation, not founder review.
- The evidence moment starts when the stage is first seen in a visible document, and its stage stacks by its own width (35rem). Laptops (1180px and up) keep the full handout composition.
- The access pages keep `auth-form.tsx` untouched. The submit button's decorative arrow is hidden in CSS, because `DESIGN.md` forbids arrows appended to button text.
- Lower landing sections use the brief's invented brachial plexus content; the sample Chat, Studio and Quiz keep their behaviour.

## Current state

**Changed:**
- Landing: `landing.tsx`, the new `landing-moment.tsx` and `landing-sections.module.css`, and the rewritten workspace, icons and styles. Four old modules were removed.
- Access pages: `auth-shell.tsx` and `auth.module.css`.
- Also changed: `DESIGN.md` and `tests/e2e/landing-experience.spec.ts`.

**Proof:**
- Static checks: `format:check`, `lint`, `tsc`, `check:boundaries`, `scan:secrets`, `lint:agents`, `test:unit` 917/917.
- Browser runs: demo `public`, `auth` and `rtl` 28/28; real `landing-experience` 7/7; real `foundation`, `auth-flows`, `hosted-synthetic-login` and `product-shell-contracts` all passing.
- Rendered review at 1440, 1280, 1180, 820, 390 and 320px, light and dark, EN and AR, in two rounds.
- The landing test caught a real pause bug, now fixed: the playing shorthand had outranked the pause rule.
- The full demo suite and `database-ci` run in CI on [#83](https://github.com/unimind989-sys/UniMind-Project/pull/83).

**Review:** independent review by the `independent-reviewer` agent of `4849cf0..4821e40`: CHANGES REQUIRED. There were no auth, consent, hosted-synthetic or data-safety findings.
- One should-fix: the access language links were 40px, below the 44px touch minimum.
- Five nits: hidden moment content without scripts, a weak "waits" and pointer test, Arabic tracking on two elements, and the stale record.
- All six were fixed in the next commit.

**Approved commit:** PENDING (overseer review under Ahmed's 17 Oct delegation).

**Remaining:** review result, required CI, approval, merge, production proof, closure.

## Next action

Record the independent review, let required CI pass on #83, record approval, merge, then deploy production.
