"use client";

import { useSyncExternalStore, useTransition } from "react";

// The root layout failed, so neither globals.css nor the fonts are present:
// the Cobalt plane, type and focus ring are inlined here (DESIGN.md).
const night = "#0c1823";
const paper = "#ecf3f9";
const action = "#2a62e0";
const secondary = "#4b5b6e";
const fonts =
  'Manrope, "Noto Sans Arabic", system-ui, -apple-system, "Segoe UI", sans-serif';
const control = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "10px 22px",
  borderRadius: 12,
  font: "inherit",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
} as const;

export default function GlobalError({
  retry,
}: Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>) {
  const arabic = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("lang") === "ar",
    () => false,
  );
  const [pending, startTransition] = useTransition();
  const t = (en: string, ar: string) => (arabic ? ar : en);
  return (
    <html lang={arabic ? "ar" : "en"} dir={arabic ? "rtl" : "ltr"}>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          background: paper,
          color: night,
          fontFamily: fonts,
          lineHeight: 1.6,
        }}
      >
        <style>{`:focus-visible{outline:2px solid #3977f7;outline-offset:2px}`}</style>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 64,
            padding: "0 max(16px, 3rem)",
            background: night,
            color: paper,
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "-0.02em",
          }}
        >
          <span dir="ltr">UniMind</span>
        </header>
        <main
          style={{
            display: "grid",
            justifyItems: "start",
            gap: 12,
            width: "min(100% - 32px, 40rem)",
            margin: "0 auto",
            paddingBlock: 48,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: arabic ? 0 : "-0.04em",
            }}
          >
            {t("UniMind could not load", "تعذر تحميل UniMind")}
          </h1>
          <p style={{ margin: 0, color: secondary, maxWidth: "60ch" }}>
            {t(
              "Try the request again. If the problem continues, report it to the project team.",
              "أعد المحاولة. إذا استمرت المشكلة، أبلغ فريق المشروع.",
            )}
          </p>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}
          >
            <button
              type="button"
              disabled={pending}
              aria-busy={pending || undefined}
              onClick={() => startTransition(() => retry())}
              style={{
                ...control,
                border: 0,
                background: action,
                color: "#ffffff",
              }}
            >
              {pending
                ? t("Trying again…", "جارٍ إعادة المحاولة…")
                : t("Try again", "حاول مرة أخرى")}
            </button>
            <a
              href={`/?lang=${arabic ? "ar" : "en"}`}
              style={{
                ...control,
                background: "#ffffff",
                color: night,
                boxShadow: "inset 0 0 0 1.5px #7a8ca3",
              }}
            >
              {t("Return to UniMind", "العودة إلى UniMind")}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
