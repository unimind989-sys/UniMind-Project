"use client";

import type { ComponentType } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NotFound from "@/app/not-found";
import { PageState } from "@/app/_components/page-state";
import { useSyntheticNavigation } from "@/app/_components/product-navigation";
import { ProductLink } from "@/app/_components/product-ui";
import { SyntheticProductProvider } from "@/app/_components/product-services";
import type { SyntheticEntryAccount } from "@/lib/demo/synthetic-account.application";
import {
  resolveSyntheticPage,
  syntheticProductPath,
  type SyntheticComposer,
} from "@/lib/demo/synthetic-route.application";
import type { ScreenProps } from "./screen-frame";
import { AuthScreen, HomeScreen } from "./screens/entry-screens";
import { CatalogScreen, StudyScreen } from "./screens/study-screens";
import { SettingsScreen } from "./screens/settings-screen";
import { AdminScreen, LeaderScreen } from "./screens/operations-screens";

/** Screen composer for each family in the synthetic route table. */
const composers: Readonly<
  Record<SyntheticComposer, ComponentType<ScreenProps>>
> = {
  home: HomeScreen,
  auth: AuthScreen,
  catalog: CatalogScreen,
  study: StudyScreen as ComponentType<ScreenProps>,
  settings: SettingsScreen,
  admin: AdminScreen,
  leader: LeaderScreen,
};

/**
 * The one synthetic client runtime. It renders the product from the browser
 * URL with document-local services; no server route, cookie or provider is
 * involved. Hosted entry (real login) and the loopback demo share it.
 */
export default function SyntheticRuntime({
  entry,
}: {
  entry?: { account: SyntheticEntryAccount; returnPath: string };
}) {
  const hosted = useSyntheticNavigation()?.hosted === true;
  const pathname = syntheticProductPath(usePathname());
  const parameters = new URLSearchParams(useSearchParams().toString());
  // Hosted entry has normal product states; review fixture selectors stay local.
  if (hosted) parameters.delete("fixture");
  const page = resolveSyntheticPage(pathname, parameters);
  const arabic = parameters.get("lang") === "ar";
  let screen;
  if (page) {
    const { composer, ...props } = page;
    const Screen = composers[composer];
    screen = <Screen key={`${pathname}|${page.fixture}`} {...props} />;
  } else if (hosted)
    screen = (
      <PageState
        kind="not-found"
        standalone
        headingLevel={1}
        locale={arabic ? "ar" : "en"}
        title={arabic ? "الصفحة غير موجودة" : "Page not found"}
        actions={
          <ProductLink href="/settings" locale={arabic ? "ar" : "en"}>
            {arabic ? "الحساب" : "Account"}
          </ProductLink>
        }
      />
    );
  else screen = <NotFound />;
  return (
    <SyntheticProductProvider {...(entry ? { entry } : {})}>
      {screen}
    </SyntheticProductProvider>
  );
}
