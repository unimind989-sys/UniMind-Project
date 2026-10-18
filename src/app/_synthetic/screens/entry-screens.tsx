"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { Landing } from "@/app/_components/landing";
import { ProductAuth } from "@/app/_components/product-auth";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { WelcomeForm } from "@/app/(auth)/_components/welcome-form";
import { Button } from "@/app/_components/product-ui";
import { saveProfile } from "@/lib/account/profile.application";
import { getProfileCopy } from "@/lib/i18n/profile-copy";
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
  if (page.screen === "welcome")
    return <SyntheticWelcome screen={screen} locale={locale} />;
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

/** A product return the profile step may continue to; anything else goes home. */
function welcomeReturn(next: string | null, home: string) {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("\\"))
    return home;
  const target = new URL(next, "https://synthetic.invalid");
  if (!/^\/(learn|settings|admin|batch-leader)(\/|$)/u.test(target.pathname))
    return home;
  target.searchParams.delete("lang");
  return target.pathname + (target.search ? target.search : "");
}

/**
 * `/welcome` in the synthetic runtime: the same profile form as the real
 * page, saving to document state. Gate order matches the real one.
 */
function SyntheticWelcome({
  screen,
  locale,
}: {
  screen: ReturnType<typeof useSyntheticScreen>;
  locale: ScreenProps["locale"];
}) {
  const { state, update, router, query, home, signedOut } = screen;
  const destination = welcomeReturn(query.get("next"), home);
  const complete = Boolean(state.displayName?.trim());
  useEffect(() => {
    if (!state.role) router.replace(`/login?lang=${locale}` as Route);
    else if (!state.consent) router.replace(`/consent?lang=${locale}` as Route);
    else if (complete)
      router.replace(
        `${destination}${destination.includes("?") ? "&" : "?"}lang=${locale}` as Route,
      );
  }, [complete, destination, locale, router, state.consent, state.role]);
  if (!state.role || !state.consent || complete)
    return <AccessPending screen={screen} />;
  const href = (language: string) => {
    const params = new URLSearchParams(query);
    params.set("lang", language);
    return `/welcome?${params}`;
  };
  return (
    <>
      <DemoBoundary screen={screen} />
      <AuthShell
        locale={locale}
        activeStep={3}
        languageHref={{ en: href("en"), ar: href("ar") }}
      >
        <WelcomeForm
          locale={locale}
          returnPath={destination}
          action={async (_state, data) => {
            const displayName = String(data.get("displayName") ?? "");
            const result = await saveProfile(
              {
                eligibleCaller: async () =>
                  state.role && state.consent ? "synthetic-caller" : null,
                save: async (_caller, profile) =>
                  update((current) => ({
                    ...current,
                    displayName: profile.displayName,
                    profiles: current.accountEmail
                      ? {
                          ...current.profiles,
                          [current.accountEmail]: profile.displayName,
                        }
                      : current.profiles,
                  })),
              },
              { displayName, locale: data.get("locale") },
            );
            return { result, displayName };
          }}
          secondaryAction={
            <Button variant="quiet" onClick={signedOut}>
              {getProfileCopy(locale).signOut}
            </Button>
          }
        />
      </AuthShell>
    </>
  );
}
