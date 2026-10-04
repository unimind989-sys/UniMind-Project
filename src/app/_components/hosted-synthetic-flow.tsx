"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { SyntheticRole } from "@/lib/demo/synthetic-account.application";
import { SyntheticProductProvider } from "./product-services";
import { ProductNativePage } from "./product-native-page";
import { resolveSyntheticPage } from "./synthetic-route";
import { ProductNavigationLink } from "./product-navigation";

export default function HostedSyntheticFlow({
  entry,
}: {
  entry: { role: SyntheticRole; returnPath: string };
}) {
  const pathname = usePathname();
  const query = useSearchParams();
  const parameters = new URLSearchParams(query.toString());
  // Hosted entry has normal product states; review fixture selectors stay local.
  parameters.delete("fixture");
  const page = resolveSyntheticPage(pathname, parameters);
  return (
    <SyntheticProductProvider entry={entry}>
      {page ? (
        <ProductNativePage key={pathname} {...page} />
      ) : (
        <main>
          <h1>
            {parameters.get("lang") === "ar"
              ? "الصفحة غير موجودة"
              : "Page not found"}
          </h1>
          <ProductNavigationLink
            href={`/settings?lang=${parameters.get("lang") === "ar" ? "ar" : "en"}`}
          >
            {parameters.get("lang") === "ar" ? "الحساب" : "Account"}
          </ProductNavigationLink>
        </main>
      )}
    </SyntheticProductProvider>
  );
}
