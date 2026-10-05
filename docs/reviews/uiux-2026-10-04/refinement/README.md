# Open Folio refinement review

This is a disconnected, unapproved design proposal. No application code or services have been modified.

- Start with [the refined direction and visual comparisons](refined-direction.md).
- Inspect [the complete visual/motion system](design-system.md).
- Review [the revised roadmap and acceptance contract](roadmap-and-acceptance.md).
- Use [the interactive prototype](index.html) for actual state transitions.
- Check [verification and limitations](verification.md) and [source-bound concept coverage](concept-coverage.json).

While the local review server is running, open [the interactive review](http://127.0.0.1:3164/refinement/index.html). Choose a screen, theme, locale and motion setting in the clearly marked review toolbar. Account’s role selector is a prototype review control; it does not grant real access.

The entire original audit folder should stay together: the refinement references the first concept’s approved brand/Manrope assets and the original live screenshots. The Arabic font subset and its license are included here. No remote scripts, runtime packages or services are required by the prototype. Opening `index.html` directly also works in a standard browser with local assets.

Suggested review flow:

1. Subjects → Open Anatomy. In Chat activate the example prompt, Send, then inspect its source. Compare full/reduced motion.
2. Preview a recoverable Chat error, then Retry. Observe that the question remains.
3. In Studio generate Structured summary or Flashcards. Turn the flashcard with Space. Compare English output within Arabic UI and Arabic output.
4. In Intake inspect all three requests and the earlier deadline. Add the sample file, edit source details, confirm sample permission, preview interruption, then Retry. Receipt remains processing pending and unavailable to students.
5. In Decisions select Hide unit deliberately, enter a synthetic reason, review the exact change, Tab through the dialog, Escape and inspect focus return. Confirmation is a local example only.
6. Inspect Account under each review role, then the shared state library’s hover/focus, validation, loading, empty, success, error and modal examples.

The prototype simulates only a subset of formats/workflows and loses local example state on reload. It is not a production architecture or authorization implementation. Founder approval remains required before implementation.
