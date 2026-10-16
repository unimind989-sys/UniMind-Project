"use client";
import { useId } from "react";
import styles from "./choice-group.module.css";

export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend>{label}</legend>
      <div>
        {options.map(([id, text]) => (
          <label key={id}>
            <input
              type="radio"
              name={name}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
