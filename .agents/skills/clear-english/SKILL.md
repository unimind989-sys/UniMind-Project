---
name: clear-english
description: Help a non-native English user understand or express technical ideas in clear natural English. Use when the user asks to simplify, re-explain ("wait, what?"), define, rephrase, find a word, or improve wording, or when language ambiguity blocks the task. Not for correcting minor grammar during normal work.
---

# Clear English

Remove the language barrier without lowering the technical level. Read the active profile and its personal vocabulary in [`docs/agents/communication.md`](../../../docs/agents/communication.md).

## Default behavior

- Answer in English. Switch languages only when the user asks.
- Treat grammar and spelling errors as noise when the intended meaning is clear.
- Preserve the user's voice and technical ambition. Never become patronizing or turn an engineering task into an English lesson.
- Use established UniMind terms from `CONTEXT.md`. Define an uncommon technical term in plain English the first time it matters.
- If wording has two materially different meanings, state the likely interpretation and ask one short question. Continue with safe work that does not depend on the answer.

## Choose the needed mode

**Re-explain.** Use when the user did not follow the previous assistant message ("wait, what?"). Re-pitch that message:

1. Start with one sentence saying where the work currently stands.
2. Explain why the current point matters before describing details or next steps.
3. Use short, direct English and one main idea per sentence. Keep necessary technical terms, define each uncommon term the first time, and use UniMind vocabulary from `CONTEXT.md`.
4. Expand acronyms and replace idioms, metaphors, and culture-specific expressions with literal wording.
5. Include a small example when the concept is easier to see than define.
6. Do not switch to Arabic unless the user asks. Do not turn the answer into a grammar lesson or correct the user's English unless requested.
7. End with the concrete next action, or the one question that must be answered next.

Preserve technical accuracy and every decision from the original message. Simplify the explanation, not the underlying subject.

**Understand.** Re-explain other text or a concept. Start with the missing context, use one main idea per sentence, and give a concrete example when useful.

**Express.** Rewrite the user's message, document, issue, or prompt in natural English while preserving tone and intent. Show the polished version first. Explain corrections only when the user asks to learn from them.

**Find the word.** When the user describes a word they cannot recall, offer two to four likely words. Give the difference, register, and one short example for each. Recommend one.

**Define.** Give the plain meaning, its meaning in the current project, and one example. Mention a commonly confused term only when the distinction matters.

**Vocabulary support.** Add a term to the personal vocabulary in `docs/agents/communication.md` only when the user asks to remember it or repeated confusion shows durable value. Store the preferred word, plain meaning, and one UniMind example. Do not log ordinary mistakes or private conversation.

## Output quality

Prefer common words, direct verbs, literal phrasing, and short paragraphs. Keep necessary precision, uncertainty, and domain vocabulary. If simplifying a prior answer, preserve every decision and constraint from that answer.

The workflow is complete when the user can act on the result without needing to decode the English.
