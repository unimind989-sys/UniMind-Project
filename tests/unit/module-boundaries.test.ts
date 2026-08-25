import { describe, expect, it } from "vitest";

import {
  inspectModuleDependencies,
  scanModuleBoundaries,
} from "../../scripts/lib/module-boundaries";

function codes(sourcePath: string, sourceText: string) {
  return inspectModuleDependencies(sourcePath, sourceText).map(
    (item) => item.code,
  );
}

describe("module boundary checker", () => {
  it("accepts the current repository graph", async () => {
    await expect(scanModuleBoundaries(process.cwd())).resolves.toEqual([]);
  });

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
});
