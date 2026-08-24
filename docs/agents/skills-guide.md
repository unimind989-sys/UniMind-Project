# UniMind skills guide

Codex can use a repository skill in two ways:

- **Automatic:** Codex may load it when your request matches its description. You can still name it with `$skill-name`.
- **Manual:** The skill runs only when you type `$skill-name`. Manual skills are deliberate tools that would be distracting or expensive to run on every nearby task.

`AGENTS.md` is different. Codex reads it before every task in this repository, so its project and communication rules are always active.

## Manual skills to remember

| Skill | Use it when | Example prompt |
| --- | --- | --- |
| `$unimind-skills` | You do not know which workflow fits the next task. | `$unimind-skills I need to decide how the ingestion modules should be divided.` |
| `$grill-me` | You want a demanding interview before committing to a plan or decision. | `$grill-me Help me choose the first Human Medicine pilot cohort for D-01.` |
| `$wait-what` | The previous assistant message did not make sense or skipped context. | `$wait-what` |
| `$blast-radius` | A change is ready or nearly ready and you want proof of what it could break outside the diff. Include a branch, commit, or fixed point. | `$blast-radius Review this branch against main and prove whether the RLS change is safe.` |
| `$web-design-guidelines` | You want a separate Vercel-only review of selected UI files. Impeccable already uses these rules during its normal web audit. | `$web-design-guidelines Review app/(student)/studio/page.tsx and its components.` |
| `$taste` | You explicitly want a stronger direction for a visitor-facing marketing or landing page. It is excluded from UniMind app screens. | `$taste Design the public beta waitlist page for prospective students.` |
| `$awesome-design-md` | You want to consult one named brand reference before confirming a visual direction. | `$awesome-design-md Compare the Linear and Notion references for this student workspace; do not adopt either yet.` |

## Skills that normally activate automatically

| Skill | What causes it to activate | You can still call it directly with |
| --- | --- | --- |
| `clear-english` | You ask for simpler wording, a definition, a rewrite, the right word, or language ambiguity blocks progress. | `$clear-english Rewrite this issue in natural technical English without changing my tone.` |
| `unslop` | Human-facing prose needs editing for a natural, specific voice. It excludes code, evidence fields, schemas, and exact controlled text. | `$unslop Edit this README section but preserve every technical requirement.` |
| `grilling` | You ask to stress-test an idea or use a grill trigger. `grill-me` is the deliberate full interview command. | `$grilling Challenge this provider-selection plan.` |
| `domain-modeling` | A domain term, `CONTEXT.md`, or an ADR is being created or changed. | `$domain-modeling Help us distinguish source asset, source version, and raw object.` |
| `codebase-design` | A module boundary, public interface, seam, dependency direction, or testability decision is being designed. | `$codebase-design Design a deep module for derived availability.` |
| `tdd` | You explicitly request test-first implementation, red-green work, or integration tests. It does not force TDD onto every task. | `$tdd Implement the availability rule one vertical slice at a time.` |
| `diagnosing-bugs` | You report a hard failure, regression, exception, or performance problem. | `$diagnosing-bugs The same ingestion job sometimes charges twice after a timeout.` |
| `wizard` | Setup reaches steps only you can perform in a signed-in dashboard, credential screen, or irreversible approval flow. It generates a PowerShell guide; it does not run the manual steps. | `$wizard Create a PowerShell wizard for configuring the preview Supabase project and GitHub secrets.` |
| `writing-for-agents` | A skill, `AGENTS.md`, or another agent-facing instruction is being edited. | `$writing-for-agents Tighten these code-review instructions.` |
| `skill-maintainer` | Your feedback or a demonstrated workflow failure exposes a repeatable problem in a repo skill. It announces itself before editing. | `$skill-maintainer The TDD skill keeps asking me to confirm obvious seams. Adapt it based on our last two tasks.` |
| `impeccable` | You ask to design, redesign, critique, audit, or visually refine a frontend surface. | `$impeccable shape the student curriculum-unit workspace.` |
| `image-to-code` | You provide or select a screenshot, mockup, or generated visual and ask for a faithful implementation. | `$image-to-code Implement this selected desktop mockup and verify it at the matching viewport plus mobile.` |
| `playwright-cli` | A web task needs interactive exploration, rendered inspection, screenshots, traces, locator discovery, or Playwright test debugging. | `$playwright-cli Verify the curriculum-unit flow and capture any console or request failures.` |

## Common flows

Use the smallest useful flow. Do not invoke every skill for every task.

### New product or architecture decision

1. `$grill-me` to expose unanswered questions.
2. `domain-modeling` when terminology or a durable decision becomes clear.
3. `codebase-design` when the decision reaches module boundaries.

### Feature implementation

1. Map the task to the execution runbook.
2. `$tdd` when the public seam is known and test-first work is useful.
3. `$blast-radius` before merge for a change with indirect security, data, job, or cost effects.

### Hard bug

1. `diagnosing-bugs` builds a reproducible feedback loop and finds the cause.
2. `$blast-radius` checks whether the fix can break another path.

### Human-only service setup

1. `wizard` creates a PowerShell walkthrough for dashboard and credential steps.
2. Run the generated script yourself. The agent does not complete consent, payment, or secret-reveal steps on your behalf.

### Writing and communication

- Use `clear-english` when understanding or expression is the issue.
- Use `$wait-what` when the last answer failed completely.
- Use `unslop` when the information is correct but the finished prose sounds generic or machine-written.

### UI design

1. Run `$impeccable init` once when UI work begins. It reads the repository first, then asks only for missing durable product facts and creates `PRODUCT.md`.
2. Use `$awesome-design-md` only when you want to inspect one named reference before deciding. A library file is inspiration, not UniMind's root design authority.
3. Use `$impeccable shape <surface>` when the workflow or visual direction needs a decision before implementation. Use `$taste` only for an explicitly requested visitor-facing marketing surface.
4. When a screenshot, mockup, or generated reference is selected, `image-to-code` measures and implements it without inventing missing product behavior.
5. Let Impeccable choose the surface mode. UniMind app screens normally use **Operate**; a marketing page uses **Persuade**; documentation uses **Read**.
6. After real visual decisions or code exist, use `$impeccable document` to create or refresh root `DESIGN.md`. Do not create fake tokens before that point.
7. Use the project-pinned Playwright CLI for rendered interaction and visual checks; keep `pnpm test:e2e` as the repeatable E2E gate.
8. Use `$impeccable audit <target>` for the integrated technical review. It includes the pinned Vercel guidelines. Call `$web-design-guidelines <target>` only for a separate Vercel-only report.

The deterministic Impeccable edit hook is not enabled during planning. Without the hook, Impeccable runs its detector explicitly during its finish workflow. Add the hook later only after reviewing it and approving it through Codex's `/hooks` screen.

### Improving the skill system

`skill-maintainer` uses real feedback as evidence. It makes the smallest reusable correction, validates the skill, and records the change in `.agents/skills/ADAPTATIONS.md`. It does not silently learn from typos, private data, or one unusual task, and it does not promise a final "100% fit." Fit improves as the project produces real evidence.

## Invocation syntax

Start a message with the skill name and your goal:

```text
$skill-name Your request and the important input.
```

If you cannot remember the name, use:

```text
$unimind-skills Describe what you are trying to do.
```
