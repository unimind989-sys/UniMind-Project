# Module boundaries

Use this map before adding application code. A module exposes a small interface at a seam; callers and tests use the same interface. Import the exact file that owns the interface rather than a broad barrel.

## Layer naming

| Layer | File/folder convention | May depend on | Must not depend on |
| --- | --- | --- | --- |
| UI | `src/app/**`, `src/components/**` | application interfaces, shared validation/types | domain implementations, concrete adapters, provider SDKs |
| Application | `*.application.ts` or `application/` | domain interfaces, adapter interfaces, shared validation/types | concrete adapters, React, Next.js request objects |
| Domain | `*.domain.ts` or `domain/` | same-domain pure code, shared validation/types | React, Next.js, database/config modules, provider SDKs, application or adapter implementations |
| Adapter | `*.adapter.ts` or `adapters/` | the interface it satisfies, provider SDKs needed by that adapter | UI modules or business-state authority |
| Server-only | `*.server.ts` or `server/` | server dependencies | Client Components |

## Synthetic demo runtime

Synthetic demo logic, fixtures and the synthetic route table live in `src/lib/demo/` as `*.application.ts` modules, so the checker covers them like any other application module. One synthetic client runtime in `src/app/_synthetic/` renders them: `synthetic-runtime.tsx` resolves the browser URL through the route table to a screen composer in `screens/`. It has two mounts in the root layout: hosted entry from the real login (`hosted-synthetic-runtime.tsx`) and the loopback demo (`loopback-synthetic-runtime.tsx`, only when `resolveDemoRuntime` is ENABLED). Shared UI under `src/app/**` may import `src/lib/demo/**`. Real-mode code must not: Supabase/server adapters (`*.server.ts`, `*.supabase.server.ts`, `server/`, `src/lib/db/**`), workers, and every `src/lib/**` module outside `src/lib/demo/` are rejected with `real-mode-imports-demo`. Next.js route entry files (`page`, `layout`, `route`, `loading`, `error`, `not-found`, `template`, `default`) and Server Actions (`actions.ts` or `"use server"`) are rejected with `route-imports-synthetic-runtime` when they import `src/lib/demo/**` or `src/app/_synthetic/**`, except the root layout's mounts and the loopback demo's document route `src/app/synthetic-runtime/[...path]/page.tsx`.

Client Components are files whose first directive is `"use client"`. Keep them narrow and pass only serializable data across the server/client seam. A privileged module must use the server-only naming convention; application implementation tasks also add `import "server-only"` when the module is loaded by Next.js.

## Automated enforcement

Run `pnpm check:boundaries`. The checker scans TypeScript/JavaScript under `src/` and `workers/` and reports the source file, imported module, and violated direction. `pnpm verify` includes this command.

The checker recognizes both file suffixes and folders so agents can keep a shallow module simple and deepen it later without changing the architectural vocabulary.
