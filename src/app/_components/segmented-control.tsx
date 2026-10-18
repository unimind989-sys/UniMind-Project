import type { Route } from "next";
import type { MouseEventHandler, ReactNode } from "react";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import { StateIcon } from "./state-pill";
import styles from "./segmented-control.module.css";

type Tone = "night" | "paper";
type Common = {
  /** Night (`--night-2` track) or paper (`--surface-2` track). */
  tone?: Tone | undefined;
  /** Accessible name of the group, nav or list. */
  label: string;
  className?: string | undefined;
  /** Compact segments (36px chip inside a 44px hit area), as in the top bar. */
  compact?: boolean | undefined;
  dir?: "ltr" | "rtl" | undefined;
};
type Segment = {
  key: string;
  label: ReactNode;
  /** Accessible name when the visible label is shortened. */
  accessibleName?: string | undefined;
  lang?: string | undefined;
  icon?: ReactNode | undefined;
};

export type SegmentedLinksProps = Common & {
  mode: "links";
  items: readonly (Segment & {
    href: string;
    current: boolean;
    hrefLang?: string | undefined;
    onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  })[];
  /** `page` for destinations; `true` for the same page in another form. */
  currentValue?: "page" | "true" | undefined;
  replace?: boolean | undefined;
  scroll?: boolean | undefined;
};
export type SegmentedButtonsProps = Common & {
  mode: "buttons";
  items: readonly (Segment & { pressed: boolean; onClick: () => void })[];
};
export type SegmentedRadiosProps = Common & {
  mode: "radios";
  name: string;
  value: string;
  disabled?: boolean | undefined;
  /** Shown as the visible legend unless hidden. */
  legendHidden?: boolean | undefined;
  describedBy?: string | undefined;
  items: readonly Segment[];
  onChange: (value: string) => void;
};
export type SegmentedStepsProps = Common & {
  mode: "steps";
  items: readonly (Segment & { state: "done" | "current" | "todo" })[];
};

export type SegmentedControlProps =
  | SegmentedLinksProps
  | SegmentedButtonsProps
  | SegmentedRadiosProps
  | SegmentedStepsProps;

const segmentContent = (segment: Segment) => (
  <span className={styles.chip}>
    {segment.icon}
    <span>{segment.label}</span>
  </span>
);

/**
 * `SegmentedControl` (DESIGN.md): a track with one current segment on
 * `--seg-on`. Navigation links carry `aria-current`, pressed buttons
 * `aria-pressed`, radios native checked state and steps `aria-current="step"`.
 * Segments wrap under enlarged text and never clip.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const { tone = "night", label, className, compact = false, dir } = props;
  const shared = {
    className: className ? `${styles.track} ${className}` : styles.track,
    "data-tone": tone,
    "data-compact": compact ? "" : undefined,
    dir,
  } as const;
  switch (props.mode) {
    case "links":
      return (
        <nav {...shared} aria-label={label}>
          {props.items.map((item) => (
            <Link
              key={item.key}
              className={styles.segment}
              href={item.href as Route}
              prefetch={false}
              {...(props.replace === undefined
                ? {}
                : { replace: props.replace })}
              {...(props.scroll === undefined ? {} : { scroll: props.scroll })}
              lang={item.lang}
              hrefLang={item.hrefLang}
              aria-label={item.accessibleName}
              aria-current={
                item.current ? (props.currentValue ?? "page") : undefined
              }
              {...(item.onClick ? { onClick: item.onClick } : {})}
            >
              {segmentContent(item)}
            </Link>
          ))}
        </nav>
      );
    case "buttons":
      return (
        <div {...shared} role="group" aria-label={label}>
          {props.items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={styles.segment}
              lang={item.lang}
              aria-label={item.accessibleName}
              aria-pressed={item.pressed}
              onClick={item.onClick}
            >
              {segmentContent(item)}
            </button>
          ))}
        </div>
      );
    case "radios":
      return (
        <fieldset
          className={`${styles.fieldset} ${className ?? ""}`}
          disabled={props.disabled}
          aria-describedby={props.describedBy}
          dir={dir}
        >
          <legend
            className={props.legendHidden ? "visually-hidden" : styles.legend}
          >
            {label}
          </legend>
          <div
            className={styles.track}
            data-tone={tone}
            data-compact={compact ? "" : undefined}
          >
            {props.items.map((item) => (
              <label key={item.key} className={styles.segment} lang={item.lang}>
                <input
                  type="radio"
                  name={props.name}
                  value={item.key}
                  checked={props.value === item.key}
                  onChange={() => props.onChange(item.key)}
                />
                {segmentContent(item)}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "steps":
      return (
        <ol {...shared} aria-label={label}>
          {props.items.map((item) => (
            <li
              key={item.key}
              className={styles.segment}
              data-state={item.state}
              aria-current={item.state === "current" ? "step" : undefined}
            >
              {segmentContent({
                ...item,
                icon: item.state === "done" ? <StateIcon tone="ok" /> : null,
              })}
            </li>
          ))}
        </ol>
      );
  }
}
