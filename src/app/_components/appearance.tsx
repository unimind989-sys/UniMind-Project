"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  resolvedTheme,
  themePreference,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme/theme.application";
import type { Locale } from "@/lib/i18n/locale";
import { ChoiceGroup } from "./choice-group";
import styles from "./appearance.module.css";

const eventName = "unimind-appearance";
function apply(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolvedTheme(
    preference,
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      root.dataset.theme === "dark" ? "#050b12" : "#0c1823",
    );
}
function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}
const snapshot = () =>
  themePreference(document.documentElement.dataset.themePreference);
const serverSnapshot = () => "system" as const;

export function ThemeRuntime() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => apply(snapshot());
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      apply(themePreference(event.newValue));
      window.dispatchEvent(new Event(eventName));
    };
    followSystem();
    media.addEventListener("change", followSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", followSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);
  return null;
}

export function Appearance({ locale }: { locale: Locale }) {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return (
    <div className={styles.appearance}>
      <ChoiceGroup
        label={locale === "ar" ? "السمة" : "Theme"}
        value={value}
        options={[
          ["system", locale === "ar" ? "النظام" : "System"],
          ["light", locale === "ar" ? "فاتح" : "Light"],
          ["dark", locale === "ar" ? "داكن" : "Dark"],
        ]}
        onChange={(value) => {
          const next = themePreference(value);
          try {
            window.localStorage.setItem(themeStorageKey, next);
          } catch {
            /* Session choice still works. */
          }
          apply(next);
          window.dispatchEvent(new Event(eventName));
        }}
      />
      <figure className={styles.preview}>
        <div className={styles.previewHeader}>UniMind</div>
        <div className={styles.previewPage}>
          <strong>{locale === "ar" ? "شاشة نموذجية" : "Example screen"}</strong>
          <div className={styles.previewMaterial}>
            <strong>{locale === "ar" ? "المحتوى" : "Content"}</strong>
            <span>
              {locale === "ar"
                ? "نص توضيحي للمعاينة"
                : "Example supporting text"}
            </span>
          </div>
        </div>
        <figcaption>
          {locale === "ar" ? "معاينة السمة" : "Theme preview"}
        </figcaption>
      </figure>
    </div>
  );
}
