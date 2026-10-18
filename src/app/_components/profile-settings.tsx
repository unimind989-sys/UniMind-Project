"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useId, useState, useTransition } from "react";

import {
  displayNameMaxLength,
  type ProfileSaveState,
} from "@/lib/account/profile.application";
import { getProfileCopy } from "@/lib/i18n/profile-copy";
import type { Locale } from "@/lib/i18n/locale";
import { profileError } from "@/app/(auth)/_components/welcome-form";
import { ChoiceGroup } from "./choice-group";
import { useProductRouter } from "./product-navigation";
import { Notice } from "./product-ui";
import accountStyles from "./student-account.module.css";
import styles from "./profile-settings.module.css";

export type ProfileSettingsProps = {
  email: string | null;
  displayName: string | null;
  save: (input: {
    displayName: string;
    locale: Locale;
  }) => Promise<ProfileSaveState>;
};

/** Settings → Profile: the name and interface language from onboarding, editable. */
export function ProfileSettings({
  locale,
  email,
  displayName,
  save,
}: ProfileSettingsProps & { locale: Locale }) {
  const copy = getProfileCopy(locale);
  const id = useId();
  const router = useProductRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const [name, setName] = useState(displayName ?? "");
  const [language, setLanguage] = useState<Locale>(locale);
  const [result, setResult] = useState<ProfileSaveState>({ status: "IDLE" });
  const [pending, startTransition] = useTransition();
  const error = profileError(result, copy);
  const nameError =
    result.status === "INVALID" && result.error !== "LANGUAGE_INVALID"
      ? error
      : null;
  const changed = name !== (displayName ?? "") || language !== locale;
  return (
    <section
      id="profile-settings"
      className={`${accountStyles.section} ${accountStyles.compactSection}`}
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`}>{copy.settingsTitle}</h2>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const saved = await save({ displayName: name, locale: language });
            setResult(saved);
            if (saved.status !== "SAVED") return;
            setName(saved.displayName);
            if (saved.locale !== locale) {
              const next = new URLSearchParams(query.toString());
              next.set("lang", saved.locale);
              router.replace(`${pathname}?${next}` as Route, {
                scroll: false,
              });
            }
          });
        }}
      >
        {email ? (
          <dl className={styles.email}>
            <dt>{copy.email}</dt>
            <dd>
              <bdi dir="ltr">{email}</bdi>
            </dd>
          </dl>
        ) : null}
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>{copy.name}</label>
          <input
            id={`${id}-name`}
            name="displayName"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setResult({ status: "IDLE" });
            }}
            autoComplete="name"
            autoCapitalize="words"
            spellCheck={false}
            dir="auto"
            maxLength={displayNameMaxLength}
            required
            aria-invalid={nameError !== null}
            aria-describedby={`${id}-hint${nameError ? ` ${id}-error` : ""}`}
          />
          <span id={`${id}-hint`} className={styles.hint}>
            {copy.nameHint}
          </span>
          {nameError ? (
            <span id={`${id}-error`} className={styles.error}>
              {nameError}
            </span>
          ) : null}
        </div>
        <ChoiceGroup
          label={copy.language}
          value={language}
          options={[
            ["en", "English"],
            ["ar", "العربية"],
          ]}
          onChange={(value) => {
            setLanguage(value === "ar" ? "ar" : "en");
            setResult({ status: "IDLE" });
          }}
        />
        <div className={styles.actions}>
          <button
            type="submit"
            className={accountStyles.primary}
            disabled={pending || !changed}
            aria-busy={pending}
          >
            {pending ? copy.saving : copy.saveSettings}
          </button>
        </div>
        {result.status === "SAVED" ? (
          <Notice success>{copy.saved}</Notice>
        ) : error && !nameError ? (
          <Notice error>{error}</Notice>
        ) : null}
      </form>
    </section>
  );
}
