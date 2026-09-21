# Frontend quality floor

Apply this capability to every task whose execution envelope includes `frontend`. It is a compact floor, not a design process.

Before editing, read the relevant product authority and root `DESIGN.md`. Preserve existing visual decisions; missing tokens or brand rules are unknowns, not permission to invent them.

Prove the applicable behavior through the changed public seam:

- semantic HTML and accessible names;
- keyboard and visible focus behavior;
- responsive layout at the affected desktop and mobile widths;
- correct LTR/RTL behavior and resilient long content;
- loading, empty, error, disabled, and interruption states reached by the change;
- interaction behavior with repeatable Playwright Test coverage where it is a stable seam;
- one bounded rendered inspection in the Codex side browser.

Use Impeccable only for design direction, redesign, significant UX restructuring, interaction-design judgment, critique, or substantial visual refinement. A small copy, spacing, or behavior correction keeps this floor without starting the full design workflow.

Use the project-pinned Playwright CLI only for explicit trace, locator-discovery, or test-debugging work. Open external Chrome only when the user asked to see the result or a founder must make a real visual/product decision.

A render proves appearance, not authorization, privacy, accessibility, security, or delivery. Keep those checks in their owning seams.
