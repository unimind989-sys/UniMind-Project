import type { ReactNode } from "react";

import styles from "./meta-list.module.css";

export type MetaItem = {
  key: string;
  value: ReactNode;
  /** A field name announced before the value; visible only when asked. */
  label?: string | undefined;
  labelVisible?: boolean | undefined;
  lang?: string | undefined;
  dir?: "ltr" | "rtl" | "auto" | undefined;
};

/**
 * `MetaList`: metadata as structured fields instead of a middle-dot string
 * (DESIGN.md "Brand and copy"). Items wrap; the separator is a drawn rule,
 * never a text character, so screen readers hear only the values. Empty
 * values are omitted.
 */
export function MetaList({
  items,
  label,
  className,
  id,
}: Readonly<{
  items: readonly (MetaItem | false | null | undefined)[];
  /** Accessible name of the list when it needs one. */
  label?: string | undefined;
  className?: string | undefined;
  id?: string | undefined;
}>) {
  const shown = items.filter(
    (item): item is MetaItem =>
      Boolean(item) &&
      (item as MetaItem).value !== null &&
      (item as MetaItem).value !== undefined &&
      (item as MetaItem).value !== "",
  );
  if (shown.length === 0) return null;
  return (
    <ul
      className={className ? `${styles.list} ${className}` : styles.list}
      aria-label={label}
      id={id}
    >
      {shown.map((item) => (
        <li key={item.key} lang={item.lang} dir={item.dir}>
          {item.label ? (
            <span
              className={item.labelVisible ? styles.label : "visually-hidden"}
            >
              {item.label}:{" "}
            </span>
          ) : null}
          <bdi>{item.value}</bdi>
        </li>
      ))}
    </ul>
  );
}
