import type { ReactNode } from "react";

import { StateIcon } from "./state-pill";
import styles from "./field.module.css";

export type FieldControlProps = {
  id: string;
  className: string | undefined;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/**
 * `Field` (DESIGN.md): a native control with its label, helper and error.
 * The hint and error sit outside the `<label>` (the label stays the
 * accessible name) and are linked through `aria-describedby`; an error also
 * sets `aria-invalid`. The child renders the control with the given props.
 */
export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: Readonly<{
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string | undefined;
  children: (control: FieldControlProps) => ReactNode;
}>) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ");
  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children({
        id,
        className: styles.control,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true as const } : {}),
      })}
      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          <StateIcon tone="bad" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
