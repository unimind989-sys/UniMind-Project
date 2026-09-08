# Auth session revocation policy

**Status:** APPROVED — SYNTHETIC/PREVIEW SECURITY BASELINE

**Owner:** Ahmed, acting as security/data reviewer for WP02-T08

**Approvers:** Ahmed + Ziad

**Version/effective date:** 1.0 / 2026-09-08

**Applies to:** WP02-T08 and every later authenticated application path

## Required behavior

- Access tokens expire after at most 3,600 seconds. They may remain cryptographically valid after a server-side sign-out or user deletion until that expiry; no application path may treat signature validity alone as durable authorization.
- Refresh-token rotation remains enabled with a 10-second reuse interval. Global sign-out, session revocation, or user deletion must make the affected refresh token unusable immediately.
- Every database operation recomputes access from current authoritative rows. Suspending or disabling a profile, revoking its role or membership, locking its cohort, unpublishing its unit, invalidating source rights, or deleting the user must remove the corresponding access on the next database operation even when an older access token has not expired.
- Deleting an Auth user cascades its profile and caller-owned authorization rows according to the versioned foreign keys. Protected audit and provenance records must remain intact; application code may delete only marker-protected synthetic Auth fixtures until a later user-lifecycle task defines real-account deletion.
- Browser and student server paths use the publishable key plus the user's session. The service-role credential may exist only in a server-only privileged module and must never be substituted to make a user query succeed.
- Privileged Auth actions require an active administrator actor, a reason, and a correlation ID. The action emits append-only `STARTED` plus terminal `SUCCEEDED` or `FAILED` audit events containing only synthetic identifiers and a bounded provider error code.

## Storage boundary

D-18 remains open. No real object-storage provider or client upload path is approved. Supabase Storage therefore stays without UniMind buckets or `anon`/`authenticated` object policies. Signed-upload creation/finalization and upsert must fail closed. If a later approved provider permits upsert, its policy suite must separately prove the required `INSERT`, `SELECT`, and `UPDATE` checks before enablement.

## Verification

The disposable Supabase/Auth integration suite must prove caller-scoped allowed and cross-user-denied reads, signed-upload and upsert denial, immediate refresh failure after deletion, continued JWT signature verification only within its configured expiry, immediate RLS data denial, and immutable privileged-action audit records. Static security tests must prove that the service-role constructor cannot enter student, browser, UI, or worker module graphs.
