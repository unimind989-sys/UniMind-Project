import type { ReactNode } from "react";
import styles from "./frontend-system.module.css";

export type FrontendIconName =
  | "shelf"
  | "chat"
  | "studio"
  | "quiz"
  | "sources"
  | "settings"
  | "back"
  | "plus"
  | "send"
  | "check"
  | "summary"
  | "cards"
  | "account"
  | "upload"
  | "shield"
  | "arrow"
  | "chevron"
  | "globe";
export type IconSize = 16 | 20 | 24;
// Icons share one 24-unit grid with a 1.75 stroke (2 for check, send and
// back) and render at 16, 20 or 24px (DESIGN.md).
export function FrontendIcon({
  name,
  size = 20,
}: {
  name: FrontendIconName;
  size?: IconSize;
}) {
  const paths: Record<FrontendIconName, ReactNode> = {
    shelf: (
      <>
        <path d="M4 4h6v13H4zM14 4h6v13h-6zM2 21h20" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v12H8l-4 4V5Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    studio: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" />
      </>
    ),
    quiz: (
      <>
        <path d="M9 4H5v17h14V4h-4M9 2h6v4H9zM8 11l2 2 5-4M8 17h7" />
      </>
    ),
    sources: (
      <>
        <path d="M6 3h12v16H8a2 2 0 0 0 0 4h10M6 3v18M10 7h4M10 11h4" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="17" r="3" />
      </>
    ),
    back: <path d="m14 6-6 6 6 6M8 12h12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    send: <path d="m5 12 7-7 7 7M12 5v15" />,
    check: <path d="m5 12 4 4L19 6" />,
    summary: (
      <>
        <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
      </>
    ),
    cards: (
      <>
        <rect x="7" y="6" width="13" height="15" rx="2" />
        <path d="M16 3H4v14M10 11h7M10 15h5" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    upload: (
      <>
        <path d="m7 8 5-5 5 5M12 3v12M4 14v7h16v-7" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
  };
  return (
    <svg
      className={styles.icon}
      width={size}
      height={size}
      data-directional={name === "back" || name === "arrow" || undefined}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={["check", "send", "back"].includes(name) ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
