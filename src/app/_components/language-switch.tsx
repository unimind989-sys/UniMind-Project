"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";

import {
  ProductNavigationLink as Link,
  useProductRouter,
} from "@/app/_components/product-navigation";
import { supportedLocales, type Locale } from "@/lib/i18n/locale";
import { SegmentedControl } from "./segmented-control";
import styles from "./language-switch.module.css";

const names: Record<Locale, string> = { en: "English", ar: "العربية" };
const shortNames: Record<Locale, string> = { en: "EN", ar: "ع" };

type SwitchProps = Readonly<{
  locale: Locale;
  /** `segmented` (shell, access pages) or a single text `link` (landing). */
  variant?: "segmented" | "link";
  /** `short` shows "EN" / "ع"; the accessible names stay the full names. */
  labels?: "short" | "full";
  /** Server-built targets: link mode. Without them: pressed buttons. */
  hrefs?: Readonly<Record<Locale, string>> | undefined;
  /** Accessible name of the group or nav. */
  label?: string | undefined;
  className?: string | undefined;
}>;

/**
 * The one interface-language control (DESIGN.md; WP03 plan D1). Route, query
 * and fragment are kept, navigation is a same-document replace, and no
 * subtree is keyed by locale, so drafts and selections survive the switch.
 */
export function LanguageSwitch(props: SwitchProps) {
  return props.hrefs || props.variant === "link" ? (
    <LinkSwitch {...props} />
  ) : (
    <ButtonSwitch {...props} />
  );
}

const groupName = (locale: Locale, label: string | undefined) =>
  label ?? (locale === "ar" ? "لغة الواجهة" : "Interface language");

const segments = (labels: "short" | "full") =>
  supportedLocales.map((language) => ({
    key: language,
    label: labels === "short" ? shortNames[language] : names[language],
    accessibleName: labels === "short" ? names[language] : undefined,
    lang: language,
  }));

const switchClass = (className: string | undefined) =>
  className ? `${styles.switch} ${className}` : styles.switch;

/** Product shell: native buttons with `aria-pressed`. */
function ButtonSwitch({
  locale,
  labels = "short",
  label,
  className,
}: SwitchProps) {
  const router = useProductRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  return (
    <SegmentedControl
      mode="buttons"
      tone="night"
      compact
      dir="ltr"
      label={groupName(locale, label)}
      className={switchClass(className)}
      items={segments(labels).map((item) => ({
        ...item,
        pressed: item.key === locale,
        onClick: () => {
          if (item.key === locale) return;
          const next = new URLSearchParams(query.toString());
          next.set("lang", item.key);
          router.replace(
            `${pathname}?${next.toString()}${window.location.hash}` as Route,
            { scroll: false },
          );
        },
      }))}
    />
  );
}

/** Access pages and landing: links built on the server; the fragment, which
 * the server never sees, is added on click. The links never prefetch: the
 * proxy remembers the language a same-origin page request names, so no page
 * fetch may name a language other than the one on screen
 * (`locale-preference.application.ts`). */
function LinkSwitch({
  locale,
  variant = "segmented",
  labels = "full",
  hrefs,
  label,
  className,
}: SwitchProps) {
  const router = useProductRouter();
  const hrefFor = (language: Locale) =>
    hrefs?.[language] ?? `/?lang=${language}`;
  const keepFragment =
    (language: Locale) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        !window.location.hash ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      router.replace(`${hrefFor(language)}${window.location.hash}` as Route, {
        scroll: false,
      });
    };

  if (variant === "link") {
    const other: Locale = locale === "en" ? "ar" : "en";
    return (
      <Link
        className={className ? `${styles.text} ${className}` : styles.text}
        href={hrefFor(other) as Route}
        lang={other}
        hrefLang={other}
        prefetch={false}
        onClick={keepFragment(other)}
      >
        {names[other]}
      </Link>
    );
  }
  return (
    <SegmentedControl
      mode="links"
      tone="night"
      compact
      dir="ltr"
      label={groupName(locale, label)}
      className={switchClass(className)}
      currentValue="true"
      replace
      scroll={false}
      items={segments(labels).map((item) => ({
        ...item,
        href: hrefFor(item.key),
        hrefLang: item.key,
        current: item.key === locale,
        onClick: keepFragment(item.key),
      }))}
    />
  );
}
