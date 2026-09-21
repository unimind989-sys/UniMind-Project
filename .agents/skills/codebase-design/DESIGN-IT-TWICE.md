# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, the primary agent designs multiple alternatives before choosing. Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before generating alternatives, write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints, not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The explanation fixes the comparison criteria without turning the step into an approval pause.

### 2. Generate alternatives

The primary agent produces at least two **radically different** interfaces itself. A single bounded challenger may be used only when the central execution policy permits one worker and the user or task has authorized delegation. Skill instructions never add worker budget, and nested workers are prohibited.

Apply a different constraint to each alternative:

- Alternative 1: "Minimize the interface: aim for 1–3 entry points max. Maximise leverage per entry point."
- Alternative 2: "Optimise for the most common caller: make the default case trivial."
- Optional alternative: "Maximise flexibility" or "Design around ports and adapters" when the dependency shape makes that materially different.

Use both [SKILL.md](SKILL.md) vocabulary and `CONTEXT.md` vocabulary consistently.

Each alternative includes:

1. Interface (types, methods, params, plus invariants, ordering, error modes)
2. Usage example showing how callers use it
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs: where leverage is high, where it's thin

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated: the user wants a strong read, not a menu.
