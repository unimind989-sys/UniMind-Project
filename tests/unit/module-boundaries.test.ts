import { describe, expect, it } from "vitest";

import { inspectModuleDependencies } from "../../scripts/lib/module-boundaries";

function codes(sourcePath: string, sourceText: string) {
  return inspectModuleDependencies(sourcePath, sourceText).map(
    (item) => item.code,
  );
}

describe("module boundary checker", () => {
  it("rejects framework and provider imports from domain modules", () => {
    expect(
      codes(
        "src/lib/catalog/term.domain.ts",
        'import React from "react"; import { createClient } from "@supabase/supabase-js";',
      ),
    ).toEqual(["domain-imports-framework", "domain-imports-provider"]);
  });

  it("rejects concrete adapters from application modules", () => {
    expect(
      codes(
        "src/lib/catalog/load.application.ts",
        'import { repository } from "./catalog.adapter";',
      ),
    ).toContain("application-imports-concrete-adapter");
  });

  it("rejects domain implementations from UI modules", () => {
    expect(
      codes(
        "src/components/catalog.tsx",
        'import { rule } from "@/lib/catalog/term.domain";',
      ),
    ).toContain("ui-imports-inner-implementation");
  });

  it("rejects server-only imports from Client Components", () => {
    expect(
      codes(
        "src/components/profile.tsx",
        '// profile interaction\n"use client"; import { secrets } from "@/lib/config/secrets.server";',
      ),
    ).toContain("client-imports-server");
  });

  it("allows only the explicit browser Supabase seam into Client Components", () => {
    expect(
      codes(
        "src/components/auth.tsx",
        '"use client"; import { createBrowserSupabaseClient } from "@/lib/db/supabase/browser";',
      ),
    ).toEqual([]);
    expect(
      codes(
        "src/components/auth.tsx",
        '"use client"; import { createServerSupabaseClient } from "@/lib/db/supabase/server";',
      ),
    ).toContain("client-imports-server");
  });

  it("allows provider SDKs inside adapter modules", () => {
    expect(
      codes(
        "src/lib/ai/supabase.adapter.ts",
        'import { createClient } from "@supabase/supabase-js";',
      ),
    ).toEqual([]);
  });

  it("keeps the synthetic demo runtime out of server adapters and real-mode library modules", () => {
    for (const sourcePath of [
      "src/lib/account/account.supabase.server.ts",
      "src/lib/catalog/catalog-journey.application.ts",
      "src/app/learn/workspace.server.ts",
      "workers/ingestion/run.ts",
    ])
      expect(
        codes(
          sourcePath,
          'import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
        ),
      ).toContain("real-mode-imports-demo");
    expect(
      codes(
        "src/lib/collection/collection.application.ts",
        'import { demoCampaignId } from "../demo/synthetic-campaigns.application";',
      ),
    ).toContain("real-mode-imports-demo");
    for (const sourcePath of [
      "src/lib/demo/synthetic-route.application.ts",
      "src/app/_components/product-collection.tsx",
      "src/app/_synthetic/screens/study-screens.tsx",
    ])
      expect(
        codes(
          sourcePath,
          'import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
        ),
      ).toEqual([]);
  });

  it("lets real route files reach the synthetic runtime only through its mounts", () => {
    for (const [sourcePath, sourceText] of [
      [
        "src/app/learn/page.tsx",
        'import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
      ],
      [
        "src/app/learn/[cohortId]/[unitId]/layout.tsx",
        'import { loadSyntheticWorkspaceScope } from "@/lib/demo/synthetic-workspace.application";',
      ],
      [
        "src/app/api/batch-leader/campaigns/[campaignId]/uploads/route.ts",
        'import { demoCampaignId } from "@/lib/demo/synthetic-campaigns.application";',
      ],
      [
        "src/app/admin/actions.ts",
        'import { actionFixtures } from "@/lib/demo/synthetic-fixtures.application";',
      ],
      [
        "src/app/learn/chat-helpers.ts",
        '"use server"; import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
      ],
      [
        "src/app/settings/page.tsx",
        'import SyntheticRuntime from "@/app/_synthetic/synthetic-runtime";',
      ],
      [
        "src/app/layout.tsx",
        'import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
      ],
      [
        "src/app/layout.tsx",
        'import SyntheticRuntime from "./_synthetic/synthetic-runtime";',
      ],
    ] as const)
      expect(codes(sourcePath, sourceText)).toContain(
        "route-imports-synthetic-runtime",
      );
    expect(
      codes(
        "src/app/layout.tsx",
        'import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application"; import { HostedSyntheticRuntime } from "./_synthetic/hosted-synthetic-runtime"; import { LoopbackSyntheticRuntime } from "./_synthetic/loopback-synthetic-runtime";',
      ),
    ).toEqual([]);
    expect(
      codes(
        "src/app/synthetic-runtime/[...path]/page.tsx",
        'import { resolveSyntheticPage } from "@/lib/demo/synthetic-route.application";',
      ),
    ).toEqual([]);
    // Shared UI below the route files (the auth form intercept, leaf screens)
    // is not a route entry.
    expect(
      codes(
        "src/app/(auth)/_components/auth-form.tsx",
        '"use client"; import { syntheticLoginRole } from "@/lib/demo/synthetic-account.application";',
      ),
    ).toEqual([]);
  });
});
