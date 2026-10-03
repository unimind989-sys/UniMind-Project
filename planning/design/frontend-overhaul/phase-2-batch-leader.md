# Phase 2 Batch Leader implementation

Status: implemented and approved by Ahmed at candidate `4c03b80`; see the
[direct receipt](batch-leader-approval.md). Admin implementation is now authorized.
Authority: [DESIGN](../../../DESIGN.md), the approved Phase 1 direction and
[student approval](student-approval.md). Task WP03-T09; same branch; zero workers.

## Implementation contract

One leader shell: Uploads, History, Account. Assigned campaign list → campaign
context → mixed-file queue → individual received receipts → existing latest
submission states. Native multiple picker and drop both retain every selected
file. Inspect bytes using the existing PDF/WAV/PNG validator. Preselect only a
unique compatible outstanding requested item; ambiguity needs an explicit choice.
Keep per-source titles/descriptions and a declaration covering every selected
source. Upload and finalize each file through existing seams; processing never
blocks another upload. Preserve approved-reference fixture, cancellation, bounded
validation errors, replay protection, stable retry keys and replacement guidance.

History contains the caller's existing latest submissions in currently assigned
active campaigns, not an invented complete archive. No backend API/schema,
dependency, provider, storage policy, worker or processing change was made.

## Trust map before implementation

- Identity and campaign/item scope remain verified server identity, current
  assignment/expiry, repository/RLS and existing register/finalize checks.
- File bytes, names, MIME hints, item IDs, metadata, rights checkbox, retry key,
  upload receipt and deep-link return are untrusted. UI inference grants no access.
- Keep server byte/type/size/checksum/object evidence validation and assignment
  rechecks. Upload receipt is not a submission until finalize succeeds. RECEIVED
  is not processed, accepted or available to students.
- Synthetic allowFile checks metadata and exact supplied bytes before accepting
  content; private/unknown files never enter simulated upload. All API/actions
  stay rejected in synthetic runtime; local injected ports do no external work.
- One active per-file operation; cancellation/unmount ignores stale progress and
  receipt callbacks. Retry keeps file/item/key and any verified receipt; finalize
  replay cannot create a second submission. Removing/reassigning a draft gets a
  fresh key; never change the target of a registered receipt.
- Default role and explicit campaign returns remain internal and reauthorized
  by existing campaign entry guards. Anonymous/expired/revoked/wrong-campaign
  callers gain no scope. No admin/publication/provider/chat permission is added.
- Queue drafts are document memory only. History reads existing caller-scoped
  records. Screenshots/logs use only fixed supplied synthetic files and metadata.

## Verification budget

Rejecting proof: matching/duplicate queue rules, stable-key/receipt retry and
cancellation, mixed picker/drop, metadata/rights, received-vs-processing, existing
collection authorization/checksum/lifecycle tests, Auth return denial, type/lint
and module boundaries. Run affected normal and native leader browser checks once
the candidate is stable, then one bounded in-app desktop/mobile Light/Dark EN/AR
review with loading, error, empty, received and interruption states. Record exact
failures/replays and reuse unaffected student proof. Broad product-wide and
database/CI/delivery proof remain for the final stable accepted candidate.

The rendered Batch Leader checkpoint is approved. Required next checkpoint:
rendered Admin review and explicit approval before final consistency. Focused PASS below is not product-wide verification,
founder acceptance or permission to deliver this unfinished overhaul.

## Changed routes and components

- `/batch-leader`: caller-scoped assigned campaigns; `?view=history` uses the
  same repository's existing latest submissions. Empty states give a next step.
- `/batch-leader/campaigns/[campaignId]`: the shared `CollectionFlow` now accepts
  a mixed queue, byte-based format detection, compatible destination inference,
  source details, shared description and a rights declaration covering all files.
- `/settings`: leader uses the existing Account/Appearance controls in the shared
  shell. The demo's existing sharing/retention/reset/sign-out controls remain.
- `/batch-leader/invitation` in the native demo: one page title, campaign identity,
  existing accept/result/return behavior. No invitation service was invented.
- Normal preview composition uses the same intake and role shell. The missing
  `/preview/batch-leader` list route now composes the existing fixed repository;
  this is support for existing rejecting browser tests, not a new product flow.
- `AppShell`, `Button`, `CollectionRouteState`, `CollectionHistory`, `LeaderHome`,
  queue hook and upload adapter form the small shared component set. The existing
  upload transport and register/finalize contracts remain unchanged.

Each file has a fresh key, checking/ready/uploading/finalizing/error/received state,
visible progress and its own retry. Valid rows continue after a rejected/failed
row. Cancel stops the active transport and future rows, retaining drafts; it cannot
undo an already started server finalizer. Unmount aborts transport and discards
stale callbacks. Draft reassignment gets a new key; registered receipts lock
metadata/destination. Duplicate selection uses file metadata for convenience,
while server checksums remain authoritative. New files require a fresh declaration.

The existing PDF/WAV/PNG and 10 MiB limits remain. The current stage accepts only
synthetic sources, and the UI says so. Source names default from filenames;
description remains required. The native review accepts only supplied exact
synthetic bytes and the fixed approved-reference port.

## Auth and persistence changes

One necessary return-path adjustment: the existing internal allowlist now accepts
the leader list and campaign paths, so an invited leader returns to the campaign
after sign-in. External hosts, malformed/encoded escape paths, API paths and admin
returns remain rejected by the same validator. Existing route/repository/action
guards reauthorize the caller. The leader list's sign-in redirect preserves the
bounded History view, and the native demo preserves only its known History query
alongside the pre-existing fixture query. No client hint grants real identity or
permission. This changes navigation adapters/domain validation only; no backend
service, database, storage or durable queue contract changes.

Appearance continues using the approved local preference. Upload drafts are
ephemeral; History uses existing durable records in real mode and document-local
invented receipts in the demo. The student academic migration still needs the
guarded Linux database proof before application deployment; this milestone neither
executes nor proves it.

## Observed focused proof

Detailed run outcomes, retained failures and invalidation limits:
[`checks.json`](batch-leader-checkpoint/checks.json).

- Initial affected collection/Auth/security unit run: 8 files, 62 tests passed.
  After correcting the helper's application-layer placement: 2 files, 7 tests
  passed. Existing authorization, expiry, byte/checksum and replay rules retained.
- Normal collection browser coverage: 12 unique cases passed across retained
  focused runs. Covers all mixed picker/drop files, ambiguous destination,
  interruption, stable key, cancel, finalize-only retry, invalid/oversize input,
  renewed rights, keyboard, 360px AA EN/AR Light/Dark and non-identifying denial.
- Native leader coverage: 12 unique affected cases passed across retained runs.
  Queue/History/Account exercise all four locale/theme pairs at 1440/768/430/390/
  360/320, 44px controls, reduced motion and 200% text at 320. Account and invitation
  get focused AA checks in both themes/languages; empty History return and sign-out
  student→leader→admin are exercised. Native isolation rejects all mutations, APIs,
  foreign requests and inherited document identity.
- TypeScript, changed-file ESLint, module boundaries and repository secret scan
  passed. The one owned Impeccable detector pass returned zero findings. Full
  diff/whitespace/secret/scope review passed, along with owned formatting and agent
  readiness (447 names, 108 links, 23 decisions, 113 task contracts). Final secret
  scan inspected 2928 files; the packet binds 34 captures and 24 sources.

Earlier failures remain failures: invalid mixed test fixture representation,
ambiguous role/label locators, a genuine missing campaign-error boundary, outdated
sign-out navigation and an ignored History return were corrected and affected
checks replayed. A zero-match grep was not a test PASS. No single complete browser
suite, database suite, broad verify, build, exact-head CI or production PASS is
claimed for this milestone. Unchanged student proof is reused only where inputs
remain unaffected.

## Rendered review and limitations

[`manifest.json`](batch-leader-checkpoint/manifest.json) binds actual in-app JPEG
pixels, routes, viewports, scroll positions, theme/locale/direction and source hashes.
Frames are viewport captures, not full-page screenshots. Reviewed campaign and
history on desktop and mobile, EN/AR Light/Dark; mixed queue, live progress,
individual receipts, retry interruption, invalid input, loading, empty list/history,
error/expired access and invitation decision. Account uses the same section style.
Only invented supplied data was used; no real files, users or services were touched.

The inline, non-independent Impeccable finish review is recorded in
[`finish-review.md`](batch-leader-checkpoint/finish-review.md). Its disposition is
scoped to presenting this milestone. Screenshots and mocks do not prove real Auth,
storage durability, processing or live account persistence. History cannot show a
complete prior/archive timeline because the existing repository does not provide
one; this limitation is stated in the UI. No speculative endpoint was added.

## Next safe action

Ahmed approved this candidate at `4c03b80`; see the direct receipt above.
The implemented Admin milestone now awaits its explicit rendered checkpoint. Keep PR #64 draft/unmerged, the native
loopback review available and WP03-T09 in progress. Product-wide consistency,
guarded broad proof, database/CI, affected production proof and final task closure
remain later gates. Unrelated logo concepts, original kit and task-record block
remain untouched.
