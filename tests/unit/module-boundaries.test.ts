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
      "src/app/preview/learn/preview-workspace.server.ts",
    ])
      expect(
        codes(
          sourcePath,
          'import { syntheticCatalogRows } from "@/lib/demo/synthetic-catalog.application";',
        ),
      ).toEqual([]);
  });
});
