"use client";

import { useEffect } from "react";
import { ProductAdmin } from "@/app/_components/product-admin";
import { ProductCollection } from "@/app/_components/product-collection";
import {
  ProductCampaigns,
  ProductResource,
} from "@/app/_components/product-operations";
import { LeaderHome } from "@/app/batch-leader/_components/leader-home";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import {
  assignedSyntheticCampaigns,
  demoCampaignId,
} from "@/lib/demo/synthetic-campaigns.application";
import {
  AccessPending,
  FixturePanel,
  RoleChrome,
  accessPending,
  screenAccess,
  useSyntheticScreen,
  type ScreenProps,
} from "../screen-frame";

/** `/admin` and `/admin/:resource`: the decision queue and resource views. */
export function AdminScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  if (accessPending(screen)) return <AccessPending screen={screen} />;
  const access = screenAccess(screen, page);
  return (
    <RoleChrome ctx={screen} access={access} page={page}>
      {access.panel ? (
        <FixturePanel ctx={screen} access={access} page={page} />
      ) : page.screen === "decisions" ? (
        <ProductAdmin locale={page.locale} fixture={page.fixture} />
      ) : (
        <ProductResource
          locale={page.locale}
          screen={page.screen}
          scenario={page.fixture}
        />
      )}
    </RoleChrome>
  );
}

/** `/batch-leader`, its invitation and one campaign's source intake. */
export function LeaderScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  const { state, update, query } = screen;
  const { fixture, locale } = page;
  useEffect(() => {
    // The local dense fixture assigns the prepared extra campaigns.
    if (
      fixture !== "dense" ||
      screen.hosted ||
      !["campaign-list", "collection"].includes(page.screen)
    )
      return;
    update((current) =>
      current.role === "leader" &&
      current.verified &&
      current.consent &&
      !current.campaignDensity
        ? { ...current, campaignDensity: true }
        : current,
    );
  }, [
    fixture,
    screen.hosted,
    page.screen,
    state.role,
    state.verified,
    state.consent,
    update,
  ]);
  if (accessPending(screen)) return <AccessPending screen={screen} />;
  const access = screenAccess(screen, page);
  return (
    <RoleChrome ctx={screen} access={access} page={page}>
      {access.panel ? (
        <FixturePanel ctx={screen} access={access} page={page} />
      ) : page.screen === "collection" ? (
        <ProductCollection
          locale={locale}
          fixture={fixture}
          campaignId={page.campaignId ?? demoCampaignId}
        />
      ) : page.screen === "campaign-list" ? (
        <LeaderHome
          referenceTime={syntheticDemoTime.now}
          campaigns={assignedSyntheticCampaigns(state, locale)}
          locale={locale}
          history={query.get("view") === "history"}
          synthetic
        />
      ) : (
        <ProductCampaigns
          locale={locale}
          screen={page.screen}
          scenario={fixture}
        />
      )}
    </RoleChrome>
  );
}
