import type { ReactNode } from "react";

import styles from "./state-pill.module.css";

export type StateTone = "ok" | "bad" | "wait" | "neutral";

/** Line icons on a 24-unit grid (DESIGN.md): the pill never relies on colour alone. */
const icons: Record<StateTone, ReactNode> = {
  ok: <path d="m5 12 4 4L19 6" />,
  bad: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </>
  ),
  wait: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  neutral: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </>
  ),
};

export function StateIcon({ tone }: Readonly<{ tone: StateTone }>) {
  return (
    <svg
      className={styles.icon}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={tone === "ok" ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[tone]}
    </svg>
  );
}

/** `StatePill` (DESIGN.md): a status as text plus icon on its status tint. */
export function StatePill({
  tone,
  icon = tone,
  children,
  ...rest
}: Readonly<{
  tone: StateTone;
  /** The icon when it differs from the tone, such as a clock for time left. */
  icon?: StateTone;
  children: ReactNode;
  "data-status"?: string;
}>) {
  return (
    <span className={styles.pill} data-tone={tone} {...rest}>
      <StateIcon tone={icon} />
      <span>{children}</span>
    </span>
  );
}
