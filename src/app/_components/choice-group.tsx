"use client";
import { useId, type ReactNode } from "react";

import { SegmentedControl } from "./segmented-control";
import styles from "./choice-group.module.css";

/**
 * Native radios as a paper `SegmentedControl` (theme, sharing mode, study
 * language, quiz timing and difficulty). `description` explains the choice
 * or why it is unavailable and is linked through `aria-describedby`.
 */
export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  disabled = false,
  description,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: ReactNode;
}) {
  const name = useId();
  const descriptionId = `${name}-description`;
  const control = (
    <SegmentedControl
      mode="radios"
      tone="paper"
      name={name}
      label={label}
      value={value}
      disabled={disabled}
      describedBy={description ? descriptionId : undefined}
      items={options.map(([key, text]) => ({ key, label: text }))}
      onChange={onChange}
    />
  );
  if (!description) return control;
  return (
    <div className={styles.group}>
      {control}
      <p className={styles.description} id={descriptionId}>
        {description}
      </p>
    </div>
  );
}
