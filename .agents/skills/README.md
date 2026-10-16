# Repository skills

`.agents/skills/` is the single source of UniMind's skills for both coding agents. Codex reads these files directly. Claude Code reads generated copies in `.claude/skills/`, written by `pnpm skills:sync`; never edit `.claude/skills` by hand. Each skill is automatic (an agent may load it when a request matches its description) or manual (invoked as `$name` in Codex, `/name` in Claude Code). The mode lives in `<skill>/agents/openai.yaml` as `policy.allow_implicit_invocation`. Automatic loading never grants permission for external changes, paid calls, deployment, or destructive operations.

## Pinned sources

Third-party skills are copied in at fixed commits. Review upstream changes before updating, keep the license, reapply the UniMind adaptations in `ADAPTATIONS.md`, and validate. Never run an unpinned bulk update.

| Source | Pinned commit | License | Used by |
| --- | --- | --- | --- |
| <https://github.com/mattpocock/skills> | `885e2ca4d842d139e9aef4e48d366c63cb1b8013` | MIT, `MATT-POCOCK-LICENSE.txt` | `tdd`, `codebase-design`, `domain-modeling`, `diagnosing-bugs`, `grilling`, `wizard`, `skill-authoring`, `clear-english` (re-explain mode) |
| <https://github.com/cursor/plugins/tree/main/pstack> | `fd6dd6f7276956a532bb78a748a8d2818b6eb5f4` | MIT, `LAUREN-TAN-LICENSE.txt` | `unslop`, `blast-radius` |
| <https://github.com/pbakaus/impeccable> | `f88b2837a7d7c3182e46307bbbb091a1ed547571` | Apache-2.0, `IMPECCABLE-LICENSE.txt` | `impeccable` |
| <https://github.com/vercel-labs/web-interface-guidelines> | `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1` | MIT, `VERCEL-WEB-GUIDELINES-LICENSE.txt` | `impeccable/reference/vercel-web-interface-guidelines.md` |
| <https://github.com/google-labs-code/design.md> | `9bf8eae67128b6cc55ad9bf86665767deb4c11cd` | Apache-2.0, `GOOGLE-DESIGN-MD-LICENSE.txt` | `impeccable/reference/google-design-md-spec.md` |
| <https://github.com/anthropics/skills/tree/main/skills/frontend-design> | `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f` | Apache-2.0, `frontend-design/LICENSE.txt` | `frontend-design` |
| <https://github.com/gekkos-tech/agency-os> | `87d202e56939ad9889960a96796fc33bb76c5de0` | MIT, `AGENCY-OS-LICENSE.txt` | `image-to-code` |
| <https://github.com/kaankiziltug/logo-design-skill> | `5a02a1ab650e7dfd0d1d06f4fd303e730311ce80` | MIT, `logo-design/LICENSE`; reference SVGs are third-party trademarks (`logo-design/TRADEMARKS.md`) | `logo-design` |

## Inventory

| Skill | Origin | Mode | Purpose |
| --- | --- | --- | --- |
| `finalize` | UniMind | Automatic | Deliver the selected task: PR, required CI, merge, affected production proof, closure, cleanup. |
| `trust-boundaries` | UniMind | Automatic | Map and prove auth, authorization, RLS, and storage trust semantics. |
| `tdd` | Matt Pocock, adapted | Automatic | Build test-first in vertical slices at public seams. |
| `codebase-design` | Matt Pocock, adapted | Automatic | Deep-module vocabulary for interfaces and seams. |
| `domain-modeling` | Matt Pocock | Automatic | Sharpen domain terms in `CONTEXT.md` and record ADRs. |
| `diagnosing-bugs` | Matt Pocock, adapted | Automatic | Diagnose hard bugs through a tight, red-capable loop. |
| `grilling` | Matt Pocock | Automatic | Stress-test a plan through rounds of questions. |
| `clear-english` | UniMind, with Matt Pocock's wait-what | Automatic | Simplify, re-explain, define, or rephrase in clear English. |
| `unslop` | Cursor pstack, adapted | Automatic | Remove AI writing patterns without semantic drift. |
| `skill-authoring` | UniMind, with Matt Pocock's writing-for-agents | Automatic | Create or change skills and agent instructions from evidence. |
| `frontend-design` | Anthropic, adapted | Automatic | Intentional visual direction inside `DESIGN.md`. |
| `impeccable` | Paul Bakaus, adapted | Automatic | Critique, audit, polish, and refine UI. |
| `blast-radius` | Cursor pstack, adapted | Manual | Prove what a change could break beyond its diff. |
| `image-to-code` | Agency OS, adapted | Manual | Implement a selected screenshot or mockup faithfully. |
| `logo-design` | kaankiziltug, adapted | Manual | Explore, critique, and export logo assets. |
| `wizard` | Matt Pocock, adapted | Manual | Generate a PowerShell walkthrough for human-only setup. |

Claude Code sub-agents live in `.claude/agents/` (`independent-reviewer`, `impeccable-finish-reviewer`, `impeccable-documenter`); Codex sub-agents live in `.codex/agents/` (`independent_reviewer`) and `impeccable/agents/`.

## Changing a skill

1. Follow the `skill-authoring` skill: evidence first, the narrowest correction, upstream attribution kept.
2. Run `pnpm skills:sync`, then `pnpm lint:agents`.
3. Record the change in `ADAPTATIONS.md`, keep at least one trigger and one no-trigger case in `EVALS.md`, and update the tables above when a skill or pin changes.
