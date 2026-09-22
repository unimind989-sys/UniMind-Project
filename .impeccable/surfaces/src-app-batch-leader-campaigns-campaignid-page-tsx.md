---
version: 1
slug: "src-app-batch-leader-campaigns-campaignid-page-tsx"
primary_target: "src/app/batch-leader/campaigns/[campaignId]/page.tsx"
related_targets:
  [
    "src/app/preview/batch-leader/campaigns/[campaignId]/page.tsx",
    "src/app/batch-leader/_components/collection-flow.tsx",
  ]
---

# WP03 Batch Leader collection desk

## Scope and mode

- Primary target: `src/app/batch-leader/campaigns/[campaignId]/page.tsx`, with its authenticated upload/finalize seam and synthetic preview as related targets.
- Visitor mode: **Operate**. A Batch Leader must understand one assigned campaign, select one requested item, validate one synthetic file, and finalize without losing campaign context.

## Audience, job, action, and proof

- Batch Leaders work in English or Arabic on phone and desktop, often returning after an interrupted upload.
- The primary action is to prepare and finalize one requested synthetic source. The browser creates the retry key before upload and preserves it through interruption.
- Product proof is the caller-scoped campaign/request rail, signature/type/size/rights summary, explicit lifecycle guidance, and a safe submission result. Provider details, object keys, private source text, and other campaigns never appear.

## Inherited direction

- Extend the approved **Study Shelf** visual system: deep matte regions, a horizontal request rail with adjacent context, cool separators, one cobalt interaction voice, and explicit text-plus-shape status cues.
- The campaign rail replaces the student product rail as persistent scope. Requested items behave like compact shelf choices; the selected request expands in the same rail and keeps neighbors visible.
- This is an ordinary extension of the existing system, not a new visual direction. It adds no global tokens and does not revise `DESIGN.md`.

## Interaction and responsive constraints

- Native file input and drag/drop share one validation path. File replacement creates a fresh key; retry and cancel preserve the current key.
- Keyboard order begins with a skip link, crosses the request rail and native fields, and reaches the visually styled file input. Visible focus remains the global cobalt ring.
- Mobile collapses the campaign rail above the form, preserves a horizontally scrollable request shelf, uses 44px-or-larger interactive targets, and has no page-level overflow.
- RTL uses logical properties and one component tree. Technical MIME/format values and source names remain isolated where needed.
- Empty, validating, uploading, interrupted, uploaded, submitted, unavailable, and all six downstream submission states use truthful localized copy.

## Anti-goals

- No dashboard tiles, entertainment browsing, provider diagnostics, real-source examples, remote imagery, paid storage, or separate RTL layout.
- Do not make color the only state signal or imply that a successful upload has been accepted into the knowledge base.
