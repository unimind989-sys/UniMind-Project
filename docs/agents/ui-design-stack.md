# UniMind UI design stack

This project uses one product design director plus narrowly scoped reference, translation, browser, and review tools. Each tool has one trigger so visual opinions do not compete.

## Decision

| Layer | Choice | Responsibility |
| --- | --- | --- |
| Design and refinement | `impeccable` | Product-aware UI direction, implementation, critique, visual verification, and anti-pattern detection. |
| Marketing direction | `$taste` | Explicitly requested visitor-facing landing pages and marketing-site redesigns only. |
| Reference library | `$awesome-design-md` | One user-selected brand reference for comparison or inspiration; never an automatic design choice. |
| Visual translation | `image-to-code` | Faithful responsive implementation after a screenshot, mockup, or generated image is selected. |
| Persistent visual context | root `DESIGN.md` | Confirmed tokens, component language, responsive behavior, and design rationale. It is created after real decisions exist. |
| Rendered verification | project-pinned Playwright CLI | Interactive browser inspection, screenshots, traces, locators, and visual comparison. Playwright Test remains the automated E2E gate. |
| Standards review | pinned Vercel Web Interface Guidelines | Accessibility, forms, interaction, typography, performance, theming, touch, and internationalization checks. |
| Project learning | `skill-maintainer` | Narrow improvements when real UniMind work exposes a repeatable skill defect. |

Taste and Impeccable are not simultaneous design directors. Impeccable owns UniMind product surfaces. Taste is manual and limited to a separately requested visitor-facing marketing surface. Awesome DESIGN.md supplies references, Image to Code translates a selected visual, Playwright CLI verifies the render, and the Vercel rules review standards; none may overwrite confirmed product or root `DESIGN.md` decisions.

## Why Impeccable was selected

Repository popularity is evidence of attention, not proof of output quality. The decision also considered scope, maintenance, licensing, Codex support, and reports from people who tried the tools.

Counts checked on 2026-08-20:

| Candidate | Community signal | Fit for UniMind | Decision |
| --- | --- | --- | --- |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | 78.3k stars and 5.3k forks | Strong first-pass visual style, but the current default says it is for landing pages, portfolios, and redesigns—not dashboards or multi-step product UI. | Install as a manual marketing specialist; never route UniMind product UI to it. |
| [Impeccable](https://github.com/pbakaus/impeccable) | 60.8k stars and 3.7k forks | Supports dashboards and product UI, has an Operate mode, records product/design context, provides focused refinement commands, and includes deterministic checks. Apache-2.0 and Codex-native. | Selected. |
| [Vercel agent skills](https://github.com/vercel-labs/agent-skills) | 30.2k stars and 2.7k forks | `web-design-guidelines` is a reviewer, not a generator. Useful after or during implementation. | Use as a pinned review layer. |
| [Google DESIGN.md](https://github.com/google-labs-code/design.md) | 27.4k stars and 2.3k forks | A portable visual contract with lint/export tooling, but the specification is still alpha. | Pin the current spec and review upgrades manually. |
| [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) | Curated real-world DESIGN.md files | Useful for concrete visual comparisons, but copying a brand file wholesale would invent UniMind's design direction and can overfit another identity. | Pin the library and expose it only after a user selects a reference. |
| [Agency Agents](https://github.com/msitarzewski/agency-agents) | 146.3k stars for the whole multi-role collection | UI Designer and Brand Guardian are Claude-oriented role prompts. The repository total does not measure those two files, and their duties overlap the selected workflow. | Do not install. |

Actual user reports are mixed, which is useful. A [same-prompt comparison](https://www.reddit.com/r/ClaudeCode/comments/1syachi/best_skill_for_uxui_impeccable_vs_uxui_pro_max_vs/) preferred Taste's look by a small margin but preferred Impeccable's coherent documents and features. Other users report that [Impeccable improved Codex frontend output](https://www.reddit.com/r/codex/comments/1vnv0uh/in_your_opinion_how_good_is_gpt56sol_for_frontend/) and that its audit tools help remove the generic AI look and improve accessibility in [real project use](https://www.reddit.com/r/ClaudeCode/comments/1s2cgdo/what_do_you_guys_use_in_promptsskills_to_get_less/). Critical reports also matter: users say design skills can still produce generic or weak UX without a concrete brief or visual reference. A skill is a process aid, not a substitute for product judgment or user feedback.

## How the parts run

```text
UniMind authority (AGENTS.md + master plan + CONTEXT.md)
                         |
                         v
        Impeccable product and surface workflow
                         |
              reads selected references or images
             /                               \
  Awesome DESIGN.md                    Image to Code
             \                               /
              writes confirmed context only
                         v
                    DESIGN.md
                         |
                         v
         implementation + Playwright CLI check
                         |
                         v
 Impeccable audit + pinned Vercel guidelines + detector
                         |
                         v
       evidence-backed fixes and final handoff
```

## Commands

- First UI setup: `$impeccable init`
- Consult a named design reference: `$awesome-design-md <brand-or-comparison>`
- Plan a screen or flow: `$impeccable shape <surface>`
- Direct a visitor-facing marketing page: `$taste <surface>`
- Build or redesign from product intent: describe the UI task normally; Impeccable can activate automatically.
- Implement a selected visual: `$image-to-code <image-and-target>` or describe the supplied screenshot task normally.
- Inspect the rendered flow: `$playwright-cli <flow>` or `pnpm browser:cli <command>`.
- Review UX and hierarchy: `$impeccable critique <target>`
- Run the integrated technical audit: `$impeccable audit <target>`
- Record the implemented design system: `$impeccable document`
- Request only the Vercel rules report: `$web-design-guidelines <file-or-glob>`
- Ask which skill fits: `$unimind-skills <goal>`

The Impeccable hook is intentionally off during planning. When UI code exists, ask for `$impeccable hooks on`, inspect the generated `.codex/hooks.json`, and approve it through Codex's `/hooks` screen only if the automatic detector saves more time than it adds.

The Playwright CLI skill is kept byte-for-byte compatible with the pinned package so its built-in drift check works. UniMind's always-on rules add the local command, synthetic-state, credential, artifact, and E2E boundaries. The local wrapper disables the mutable update notifier because dependency upgrades follow the reviewed-pin policy. Do not run the CLI's global installer or commit `.playwright-cli/` output.

## Component sources and 21st.dev MCP

**Current recommendation (researched 2026-09-10): do not make 21st.dev MCP part of the required WP03 toolchain.** It may be reconsidered later as an optional component-discovery source after UniMind has an approved visual direction and component strategy; adoption still requires a named founder decision.

21st.dev can search a large component catalog, retrieve component code, generate variants, and publish team components. That can save discovery time after a surface brief and `DESIGN.md` already constrain the result. It does not replace Impeccable's product discovery, visual-world decision, or finish review, and catalog popularity is not evidence that a component fits UniMind's accessibility, RTL, privacy, performance, or maintenance requirements.

The distinction between open client code and the hosted service matters. The public `21st-dev/magic-mcp` repository is ISC-licensed, but its current package is a compatibility proxy to `https://21st.dev/api/mcp`; the catalog, code retrieval, and AI generation are hosted services that require a 21st account/API key and remain subject to 21st's terms. As checked on 2026-09-10, 21st advertises free search with two installs per day, paid Builder access for unlimited MCP/CLI retrieval, and credit-based AI generation. Therefore it is neither a fully open-source local catalog nor a zero-cost reproducible dependency.

If the founders later authorize an evaluation:

1. Use only synthetic/public prompts and public UI code. Never send private source material, student data, secrets, production logs, or unreleased proprietary context.
2. Keep the API key outside Git and browser code. Record the exact CLI/proxy version, service terms/date, plan/cost ceiling, and disable/removal procedure.
3. Use it only after the direction is approved, as a candidate-component source. Record the original component page/author/license and inspect every copied file, transitive dependency, remote asset, telemetry path, and Client Component boundary.
4. Rebuild, test, audit, and maintain the imported code locally. No clean clone, CI check, runtime path, or rollback may depend on 21st availability, credits, or mutable catalog content.
5. Compare one representative WP03 component against the open fallback below before deciding whether the saved time justifies the service and governance cost.

### Open and zero-cost-first alternatives

| Option | Best use | Tradeoff and UniMind rule |
| --- | --- | --- |
| Local semantic React/HTML plus project CSS | Default while the component strategy is unsettled | No catalog or account dependency and maximum design control, but the team owns interaction and accessibility details. Prefer native controls where they satisfy the behavior. |
| Official shadcn/ui CLI or MCP with the public registry | Search, inspect, and copy source-owned primitives/blocks through an MIT-licensed local server | Strongest open MCP substitute for 21st catalog retrieval. It introduces a registry/configuration and normally a Tailwind-oriented workflow, which UniMind has not approved. Evaluate and pin an exact CLI version before use; never put `@latest` in repeatable commands. |
| Base UI | Complex accessible unstyled React primitives | MIT and style-system neutral, with no catalog account. It is a runtime dependency and must pass bundle, React/Next compatibility, RTL, and removal review. |
| React Aria Components | Accessibility- and internationalization-heavy primitives | Apache-2.0, unstyled, and strong keyboard/touch/RTL support. It is a broader runtime dependency and still needs UniMind styling and bundle review. |
| Reviewed MIT shadcn-compatible registries such as Magic UI | A narrowly selected interaction or visual effect after the core Operate system exists | Copy-in source can remain local, but animation-heavy catalog defaults are a poor foundation for dense product UI. Verify each item's license and dependencies; do not use a catalog to choose the visual world. |

Research sources: [21st MCP capabilities and limits](https://21st.dev/mcp), [21st pricing](https://21st.dev/pricing), [21st terms](https://mcp.21st.dev/terms), [current Magic MCP compatibility proxy](https://github.com/21st-dev/magic-mcp), [shadcn MCP](https://ui.shadcn.com/docs/mcp), [shadcn/ui license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md), [Base UI](https://base-ui.com/), [React Aria](https://react-spectrum.adobe.com/react-aria/), and [Magic UI](https://magicui.design/).

Adopt no component source merely because an agent can install it. The selected option must be recorded in the WP03 task evidence with provenance, license, exact pin, accessibility/RTL proof, dependency cost, and rollback.

## Improvement rule

Do not "self-improve" by rewriting instructions after every preference or model mistake. Capture confirmed design decisions in `DESIGN.md`. Change a skill only when repeated friction, user feedback, or a failed workflow exposes a reusable instruction defect. Record that change in `.agents/skills/ADAPTATIONS.md` and add a case to `.agents/skills/EVALS.md`.
