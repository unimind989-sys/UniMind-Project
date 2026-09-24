---
version: 1
slug: "src-app-admin-page-tsx"
primary_target: "src/app/admin/page.tsx"
related_targets:
  [
    "src/app/admin/actions.ts",
    "src/app/admin/_components/admin-decision-queue.tsx",
  ]
---

# WP03 admin decision queue

## Scope and mode

- Primary target: authenticated `/admin` landing screen with the six WP03-T06 governed actions, their typed server mutations, and scoped resource navigation.
- Visitor mode: **Operate**. Ahmed or Ziad reviews an exact target and acts safely on a decision, often under incident pressure.
- Ahmed selected **decision queue first** in the 2026-09-24 task conversation. Catalog, cohort, source, job, quality, usage, and incident navigation remains available alongside it.

## Audience, job, action, and proof

- The first view shows items awaiting a decision, grouped by urgency and target scope. Counts are useful only if derived from currently authorized server state.
- Each item names the action, target/cohort/unit, current state and proposed next state, expected version, exact failed readiness predicates, and whether a distinct second founder confirmation is pending.
- Confirmations show consequences, reason, cancel, success, stale-state conflict, and recoverable failure in English and Arabic. Emergency containment remains short and explicit.
- No preview or read interaction creates a student membership, release, publication, job, paid call, or other durable mutation.

## Inherited direction

- Extend the approved Study Shelf system in `DESIGN.md`: deep matte surfaces, cool separators, a single cobalt action voice, and text-plus-shape status signals. No new global palette or typography is authorized.
- Use a clear decision queue with a persistent resource rail, not a generic editable table. A selected row opens a focused detail/confirmation area that preserves surrounding context.
- The surface is material frontend work. A rendered candidate needs a traceable founder acceptance receipt after technical proof; the starting-view preference alone is not final visual acceptance.

## States and responsive behavior

- Show loading, empty, unavailable, permission denied, readiness blocked, awaiting second founder, stale version, in-flight, success, and recoverable failure as distinct truthful states.
- Recompute scope/readiness when selecting an item and again on commit. Do not present a cached green badge as authority.
- Desktop keeps queue, context, and resource navigation readable; mobile stacks them in task order without horizontal page overflow. Long bilingual names and reasons wrap. One RTL-aware component tree uses logical CSS properties.
- Keyboard flow reaches queue, details, reason, cancel, and confirm in order with visible focus. Status never relies on color alone. Reduced motion, zoom/reflow, and touch targets follow the frontend quality floor.

## Boundaries

- Show only safe target labels, decision state, predicate names, and correlation IDs. Do not expose private source text, raw object keys, service keys, provider payloads, worker diagnostics, or another user's state.
- Open D-04/D-05/D-18/D-19 decisions keep real provider, paid, storage, and retention actions unavailable. The UI explains the exact missing gate without offering a bypass.
- Browser-selected founder names and a shared service login cannot count as two confirmations. A second confirmation comes from a distinct verified application principal bound to the same exact target/action/version.
