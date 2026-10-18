import type { ReactNode, Ref } from "react";

import type { Locale } from "@/lib/i18n/locale";
import { StateIcon, type StateIconName } from "./state-pill";
import styles from "./notice.module.css";

export type NoticeTone = "neutral" | "success" | "warning" | "error";

const icon: Record<NoticeTone, StateIconName> = {
  neutral: "info",
  success: "ok",
  warning: "warn",
  error: "bad",
};
const prefix: Record<NoticeTone, Readonly<Record<Locale, string>> | null> = {
  neutral: null,
  success: { en: "Success:", ar: "تم:" },
  warning: { en: "Warning:", ar: "تنبيه:" },
  error: { en: "Error:", ar: "خطأ:" },
};

/**
 * `Notice` (DESIGN.md "Status / Notice"): text plus icon on its status tint,
 * never colour alone; a visually hidden tone word (generated content, so the
 * message text itself stays exact) leads for screen readers.
 * `live` gives the message a live role and is only for messages that appear
 * after a user action: `alert` for errors, `status` otherwise. A notice
 * rendered with the page stays static.
 */
export function Notice({
  tone = "neutral",
  live = false,
  locale,
  children,
  className,
  id,
  ref,
  tabIndex,
  status,
}: Readonly<{
  tone?: NoticeTone;
  live?: boolean;
  locale: Locale;
  children: ReactNode;
  className?: string | undefined;
  id?: string | undefined;
  /** For a summary that takes focus after a failed submission. */
  ref?: Ref<HTMLParagraphElement> | undefined;
  tabIndex?: number | undefined;
  /** The domain status behind the message, for styling hooks and tests. */
  status?: string | undefined;
}>) {
  const word = prefix[tone]?.[locale];
  return (
    <p
      id={id}
      ref={ref}
      tabIndex={tabIndex}
      data-status={status}
      role={live ? (tone === "error" ? "alert" : "status") : undefined}
      className={className ? `${styles.notice} ${className}` : styles.notice}
      data-tone={tone}
      data-prefix={word}
    >
      <StateIcon tone={icon[tone]} />
      {children}
    </p>
  );
}
