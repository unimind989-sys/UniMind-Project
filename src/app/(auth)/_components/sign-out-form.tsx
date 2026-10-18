import { SubmitButton } from "@/app/_components/product-ui";
import type { Locale } from "@/lib/i18n/locale";
import { getProfileCopy } from "@/lib/i18n/profile-copy";

import { logoutAction } from "../actions";

/**
 * The real sign-out: a form posting to `logoutAction` with the page language
 * (WP03-T28 keeps it after sign-out). The button shows a pending label and
 * cannot be pressed twice while the action runs (IX-04).
 */
export function SignOutForm({ locale }: Readonly<{ locale: Locale }>) {
  const copy = getProfileCopy(locale);
  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <SubmitButton variant="quiet" pendingLabel={copy.signingOut}>
        {copy.signOut}
      </SubmitButton>
    </form>
  );
}
