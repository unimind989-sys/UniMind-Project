# Frontend guide

Apply this page to every task that changes rendered UI. Root `DESIGN.md` is the design authority; this page is the working floor and the tool map.

## Authority

- `DESIGN.md` holds the current design system: Direction B "Cobalt", approved in WP03-T18 (mockups `planning/design/premium-overhaul/direction-b.html` and, for the landing, `landing.html` variant L1). Approval history is in `evidence/wp03-product-shell/design-approval-history.md` and `planning/design/frontend-overhaul/`.
- Preserve existing visual decisions. A missing token or brand rule is an open question for the founder, not permission to invent one.
- Most UniMind work refines the approved direction. A new visual direction or redesign needs a founder decision first.

## Quality floor

Prove what the change reaches, through the changed public seam:

- semantic HTML and accessible names;
- keyboard and visible focus behaviour, touch targets of at least 44px;
- responsive layout at the affected desktop and mobile widths;
- correct LTR and RTL behaviour and resilient long content;
- loading, empty, error, disabled and interruption states reached by the change;
- light and dark themes where the surface supports both;
- repeatable Playwright Test coverage where the interaction is a stable seam;
- one bounded rendered inspection in the agent's built-in browser (Codex in-app browser, Claude Code browser pane), then at most one confirmation round.

A render proves appearance, not authorization, privacy, accessibility compliance, security or delivery. Keep those checks in their owning seams.

## Material or not

- **Material**: a visible presentation or interaction change to an approved surface. Needs founder approval recorded as `Approved commit: <sha>` (`docs/agents/workflow.md` step 5).
- **Not material**: no rendered effect, or a change that preserves the approved baseline. Write one line in the task record saying why.
- When unsure, treat it as material.

## Skills

| Need | Skill | Mode |
| --- | --- | --- |
| Design direction or a new surface inside the approved system | `frontend-design` | automatic |
| Critique, audit, polish, anti-pattern detection | `impeccable` (critique, audit, polish and refinement commands only) | automatic |
| Implement a selected screenshot or mockup | `image-to-code` | manual |
| Logo work | `logo-design` | manual |

`DESIGN.md` wins over any skill's defaults. Impeccable's new-design flow and image generation are disabled in UniMind (paid exposure, and they conflict with the approved design). Its audit includes the pinned Vercel Web Interface Guidelines.

## Browser use

- The built-in browser handles ordinary rendered inspection. Use Playwright Test for repeatable proof and `pnpm browser:cli` only for explicit trace or test-debugging work.
- Open external Chrome only when the founder asked to see the result or a real founder visual or product decision remains. Then run the local preview with synthetic state, give the exact URL and the flows and states to check, and record the outcome in the task record.

## Component sources

Use local semantic React/HTML with project CSS Modules by default. Tailwind is not approved. 21st.dev MCP is not part of the toolchain: it is a hosted, credit-based service (checked 2026-09-10). Any new component source (for example Base UI, React Aria, or the shadcn registry) needs a founder decision recording provenance, license, exact pin, accessibility and RTL proof, dependency cost and removal path.
