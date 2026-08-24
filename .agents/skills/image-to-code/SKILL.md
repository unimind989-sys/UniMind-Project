---
name: image-to-code
description: Implement a supplied screenshot, mockup, or generated reference as a faithful responsive frontend. Use for "image to code", "build this screenshot", or "match this design"; a written brief without a selected image uses impeccable instead.
---

# Image to Code — Faithful Website Implementation

Turn design images into a website that someone could mistake for the images. The design image is the contract: you are a builder, not a co-designer. Deviations are bugs.

## UniMind integration

- Read `AGENTS.md`, the relevant product authority, and root `DESIGN.md` when it exists. Product behavior, accessibility, security, and confirmed design decisions override a visual reference.
- Inspect every local source image with the available image-viewing tool before editing. If a required image is missing, ask the user to attach or select it instead of guessing.
- Implement through the repository's existing Next.js and component seams. A screenshot does not authorize new backend behavior, routes, dependencies, providers, or invented product state.
- Use the project-pinned Playwright CLI at the same source viewport for rendered comparison, then check a narrow mobile viewport. Run the applicable automated checks and Vercel guidelines review before handoff.
- Keep analysis notes in the task record or evidence bundle. Do not create an ungoverned root design document from a screenshot.

## Phase 0 — Resolve the selected image

- If the user provided design images, map each image to its page, section, viewport, and interaction state, then proceed to Phase 1.
- If no selected image exists, stop this workflow. Use `impeccable` to shape from a written brief or the `imagegen` skill to create options; resume only after the user selects a result.
- If the selected set leaves required sections ambiguous, ask for the missing reference or record the exact approved deviation. Do not freestyle the gaps.

## Phase 1 — Deep analysis pass (before writing any code)

Analyze EVERY image and write the findings down (a short structured note per image). Do not skim-and-code; misread proportions compound across sections.

Per image, record:

1. **Layout grid** — columns and split ratios ("hero: 12-col, text spans 5, visual spans 7"), container width (full-bleed vs boxed), alignment (left/center).
2. **Spacing rhythm** — estimate the base unit (usually 4/8px) and the big numbers: section vertical padding (typically 80–160px on desktop comps), gaps between cards, internal card padding. Note whether the design is airy or compact and keep that ratio.
3. **Exact palette** — extract actual hex values from the image (eyedropper or pixel inspection, not guesses): background, surface, primary text, secondary text, accent, border tones. Build the token list once for the whole set; sections must share it.
4. **Type scale** — count distinct sizes; measure headline-to-body ratio roughly ("hero headline ≈ 4× body"). Note weight, case, letter-spacing feel, line-height (tight display vs airy body). Choose the closest real font (e.g. Inter/Geist for grotesque, a serif for editorial) — name it in your notes.
5. **Component inventory** — enumerate every element in the image: nav items, buttons (count them! and their variants), badges, cards, icons, images, dividers, footer columns. This inventory is the build checklist — nothing added, nothing dropped.
6. **Effects** — radii, shadows (subtle or none?), gradients, borders, image treatments (rounded? full-bleed?), hover affordances implied.

Consolidate into a mini design-token block (CSS variables or theme object) BEFORE coding: colors, font sizes, spacing scale, radii, shadows. All sections consume these tokens.

## Phase 2 — Implement section by section

Work in page order, one section per pass, using the image side by side.

Per-section checklist (run it for every section):

- [ ] Same composition and split ratio as the image (measure, don't eyeball: a 40/60 split is not 50/50).
- [ ] Every inventoried element present — exact count of cards, links, buttons, icons.
- [ ] No invented extras — no bonus badge, no extra CTA, no decorative blob the image doesn't have.
- [ ] Text content matches the image where readable; where the image shows placeholder mush, write real copy of the SAME length and line count.
- [ ] Colors from the shared tokens only; no per-section improvisation.
- [ ] Type sizes preserve the image's hierarchy ratios (huge stays huge, small stays small).
- [ ] Spacing matches the image's air — if the comp breathes, the code breathes.
- [ ] Images/visuals: use real assets or well-chosen placeholders with the same aspect ratio and treatment; never stretch or letterbox.
- [ ] Responsive: the section degrades sensibly to tablet/mobile (stack splits, wrap card rows) even though the comp is desktop.
- [ ] Basic states: hover on interactive elements, focus-visible, alt text.

**Hero rule:** the hero (headline + subline + primary CTA) must be fully visible without scrolling on a 13" laptop viewport (~1440×800, ~700px of usable height). If the comp's proportions would push the CTA below the fold, compress vertical padding — this is the one sanctioned deviation, and it preserves the design's intent (the CTA is the point).

## Anti-patterns — reject these in your own output

- **Cards nested in cards** (a bordered box inside a shadowed box inside a panel). If the image shows one card level, build one card level.
- **Cramped hero** — nav, headline, badges, two paragraphs, three buttons, and a screenshot all squeezed into 600px. Match the comp's negative space.
- **Under-building** — the image shows a 3-step diagram with icons and connector lines; you ship three plain `<p>` tags. Build what the image shows, at the fidelity it shows.
- **Over-building** — adding carousels, animations, or sections the images never showed. Tasteful micro-interactions (hover lift, fade-in) are fine; new layout elements are not.
- **Palette drift** — "close enough" grays. Use the extracted hexes.
- **Uniform section rhythm** — comps alternate density and composition; don't flatten every section into the same centered stack.
- **Fake buttons** — every CTA in the comp is a real, styled, focusable element.

## Phase 3 — Verification pass

After the build renders, compare against EVERY source image, one by one:

1. Open the rendered site at desktop width; screenshot or view each section.
2. Side-by-side with its source image, check: composition ✱ element count ✱ palette ✱ hierarchy ✱ spacing feel. Note each mismatch concretely ("pricing middle card not emphasized", "hero headline too small relative to viewport").
3. Fix mismatches and re-check. Do at least one full fix cycle — first renders are never faithful.
4. Check the 13" laptop viewport for the hero rule, and one mobile width for sane stacking.
5. Only report done when every section passes or remaining deviations are listed explicitly for the user.

See `references/checklists.md` for the full analysis and verification checklists in copy-paste form.
