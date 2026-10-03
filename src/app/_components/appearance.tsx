"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  resolvedTheme,
  themePreference,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme/theme.application";
import type { Locale } from "@/lib/i18n/locale";

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
      root.dataset.theme === "dark" ? "#1b1c1f" : "#f6f7f8",
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
    <div className="appearance-field">
      <label htmlFor="appearance-theme">
        {locale === "ar" ? "السمة" : "Theme"}
      </label>
      <select
        id="appearance-theme"
        value={value}
        onChange={(event) => {
          const next = themePreference(event.target.value);
          try {
            window.localStorage.setItem(themeStorageKey, next);
          } catch {
            /* Session choice still works. */
          }
          apply(next);
          window.dispatchEvent(new Event(eventName));
        }}
      >
        <option value="system">{locale === "ar" ? "النظام" : "System"}</option>
        <option value="light">{locale === "ar" ? "فاتح" : "Light"}</option>
        <option value="dark">{locale === "ar" ? "داكن" : "Dark"}</option>
      </select>
    </div>
  );
}
