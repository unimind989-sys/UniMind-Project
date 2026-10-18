"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Appearance } from "@/app/_components/appearance";
import { ChoiceGroup } from "@/app/_components/choice-group";
import { useProductRouter } from "@/app/_components/product-navigation";
import {
  displayNameMaxLength,
  type ProfileSaveState,
} from "@/lib/account/profile.application";
import { getProfileCopy } from "@/lib/i18n/profile-copy";
import type { Locale } from "@/lib/i18n/locale";
import styles from "../auth.module.css";
import profile from "./welcome-form.module.css";

export type WelcomeFormState = Readonly<{
  result: ProfileSaveState;
  displayName: string;
}>;

export const initialWelcomeState: WelcomeFormState = {
  result: { status: "IDLE" },
  displayName: "",
};

export function profileError(
  result: ProfileSaveState,
  copy: ReturnType<typeof getProfileCopy>,
): string | null {
  if (result.status === "INVALID") return copy.errors[result.error];
  if (result.status === "FORBIDDEN" || result.status === "UNAVAILABLE")
    return copy.errors[result.status];
  return null;
}

/**
 * The first-run profile step (WP03-T27): full name (required), interface
 * language (preselected from the page) and appearance (device-local). The
 * same form serves the real `/welcome` page and the synthetic runtime.
 */
export function WelcomeForm({
  locale,
  returnPath,
  action,
  secondaryAction,
}: {
  locale: Locale;
  returnPath: string;
  action: (
    state: WelcomeFormState,
    data: FormData,
  ) => Promise<WelcomeFormState>;
  secondaryAction?: ReactNode;
}) {
  const copy = getProfileCopy(locale);
  const [state, formAction, pending] = useActionState(
    action,
    initialWelcomeState,
  );
  // Controlled, so React's reset after a form action never clears the name.
  const [name, setName] = useState(state.displayName);
  const router = useProductRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const id = useId();
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const error = profileError(state.result, copy);
  const nameError =
    state.result.status === "INVALID" &&
    state.result.error !== "LANGUAGE_INVALID"
      ? error
      : null;
  useEffect(() => {
    if (error) noticeRef.current?.focus();
  }, [state, error]);
  return (
    <section className={styles.formRegion} aria-labelledby={`${id}-title`}>
      <h1 id={`${id}-title`}>{copy.welcomeTitle}</h1>
      <p>{copy.welcomeLede}</p>
      {error ? (
        <p
          ref={noticeRef}
          className={styles.formNotice}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      ) : null}
      <form action={formAction} noValidate className={profile.form}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>{copy.name}</label>
          <input
            id={`${id}-name`}
            name="displayName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="done"
            dir="auto"
            maxLength={displayNameMaxLength}
            required
            aria-invalid={nameError !== null}
            aria-describedby={`${id}-name-hint${nameError ? ` ${id}-name-error` : ""}`}
          />
          <span id={`${id}-name-hint`} className={profile.hint}>
            {copy.nameHint}
          </span>
          {nameError ? (
            <span id={`${id}-name-error`} className={styles.fieldError}>
              {nameError}
            </span>
          ) : null}
        </div>
        <ChoiceGroup
          label={copy.language}
          value={locale}
          options={[
            ["en", "English"],
            ["ar", "العربية"],
          ]}
          onChange={(language) => {
            // The page switches language at once; the typed name stays.
            const next = new URLSearchParams(query.toString());
            next.set("lang", language);
            router.replace(`${pathname}?${next}` as Route, { scroll: false });
          }}
        />
        <Appearance locale={locale} />
        <button
          className={styles.primaryAction}
          type="submit"
          disabled={pending}
          aria-busy={pending}
        >
          <span>{pending ? copy.saving : copy.save}</span>
        </button>
      </form>
      {secondaryAction ? (
        <div className={styles.secondaryActions}>{secondaryAction}</div>
      ) : null}
    </section>
  );
}
