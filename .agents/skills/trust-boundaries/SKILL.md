---
name: trust-boundaries
description: Check UniMind identity, authorization, storage, and protected trust semantics when an execution envelope includes material auth or storage surfaces. Not for code that merely runs after login or reads an existing authorized abstraction unchanged.
---

# Trust Boundaries

Use the task's authority and execution envelope. This capability sharpens protected implementation; deterministic policies and tests own recurring guarantees.

Before mutation, record the smallest complete trust map in the task record or evidence:

1. authoritative identity and scope source;
2. untrusted or client-controlled identity, scope, ownership, path, and metadata inputs;
3. server/database point where identity, scope, and ownership are recomputed;
4. one allowed path through the public seam;
5. one forbidden or isolation path through the same seam;
6. expiry, revocation, replay, cache, and stale-state behavior that the change can affect;
7. excess data, diagnostic, browser-payload, URL, and log exposure.

Completion requires executed allowed/forbidden proof at the affected public seam, or an explicit task blocker naming why that proof is unavailable. Never treat an authenticated page, server location, table read, or storage SDK import as material trust semantics by itself; classification comes from changed behavior.
