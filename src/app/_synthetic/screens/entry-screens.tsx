"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { Landing } from "@/app/_components/landing";
import { ProductAuth } from "@/app/_components/product-auth";
import {
  AccessPending,
  DemoBoundary,
  useSyntheticScreen,
  type ScreenProps,
} from "../screen-frame";

const authModes = {
  login: "login",
  register: "register",
  "verify-email": "verify",
  consent: "consent",
  "forgot-password": "forgot",
  "reset-password": "reset",
} as const;

/** `/`: the public landing, or a redirect to the signed-in role home. */
export function HomeScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  if (!screen.state.role) return <Landing locale={page.locale} />;
  return <AccessPending screen={screen} />;
}

/** Sign-in, registration, verification, consent and recovery screens. */
export function AuthScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  const { state, update, router, query } = screen;
  const { callbackToken, locale } = page;
  useEffect(() => {
    if (callbackToken === "sample-recovery" && !state.recoveryUsed) {
      update((current) => ({ ...current, recoveryToken: true }));
      router.replace(`/reset-password?lang=${locale}` as Route);
    }
  }, [callbackToken, state.recoveryUsed, update, router, locale]);
  return (
    <>
      <DemoBoundary screen={screen} />
      <ProductAuth
        mode={authModes[page.screen as keyof typeof authModes]}
        locale={locale}
        fixture={page.fixture}
        email={query.get("email") ?? undefined}
        token={callbackToken ?? query.get("token") ?? undefined}
        next={query.get("next") ?? undefined}
      />
    </>
  );
}
