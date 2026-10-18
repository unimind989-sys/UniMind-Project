import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { logoutAction } from "../actions";
import { completeProfileAction } from "./actions";
import { AuthShell } from "../_components/auth-shell";
import { resolveAuthPageParameters } from "../_components/auth-page";
import { WelcomeForm } from "../_components/welcome-form";
import { Button } from "@/app/_components/product-ui";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { accessDestination } from "@/lib/auth/auth-actions.application";
import { currentRoleHome } from "@/lib/account/account.supabase.server";
import { getProfileCopy } from "@/lib/i18n/profile-copy";

export const metadata: Metadata = { title: "Your profile | UniMind" };

type SearchParameters = Record<string, string | string[] | undefined>;

/** The first-run profile step, after verification and consent (WP03-T27). */
export default async function WelcomePage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParameters> }>) {
  const { locale, returnPath } = resolveAuthPageParameters(await searchParams);
  let gate: Awaited<ReturnType<typeof getCurrentAuthAccess>>["gate"];
  try {
    gate = (await getCurrentAuthAccess()).gate;
  } catch {
    gate = "UNAVAILABLE";
  }
  if (gate === "READY") {
    // A returning caller never sees the step again.
    const destination = ["/", "/learn"].includes(returnPath)
      ? await currentRoleHome()
      : returnPath;
    const address = new URL(destination, "https://unimind.invalid");
    address.searchParams.set("lang", locale);
    redirect((address.pathname + address.search + address.hash) as Route);
  }
  if (gate !== "PROFILE_REQUIRED")
    redirect(accessDestination(gate, { locale, next: returnPath }) as Route);
  const href = (language: string) =>
    `/welcome?${new URLSearchParams({ lang: language, next: returnPath })}`;
  return (
    <AuthShell
      locale={locale}
      activeStep={3}
      languageHref={{ en: href("en"), ar: href("ar") }}
    >
      <WelcomeForm
        locale={locale}
        returnPath={returnPath}
        action={completeProfileAction}
        secondaryAction={
          <form action={logoutAction}>
            <Button variant="quiet" type="submit">
              {getProfileCopy(locale).signOut}
            </Button>
          </form>
        }
      />
    </AuthShell>
  );
}
