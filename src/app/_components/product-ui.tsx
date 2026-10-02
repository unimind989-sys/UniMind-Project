"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { text, type Locale, type Localized } from "./synthetic-fixtures";
import styles from "./product.module.css";

export function ProductLink({
  href,
  locale,
  children,
}: {
  href: string;
  locale: Locale;
  children: ReactNode;
}) {
  const address = new URL(href, "https://synthetic.invalid");
  address.searchParams.set("lang", locale);
  return (
    <Link
      className={styles.link}
      href={`${address.pathname}${address.search}${address.hash}` as Route}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
export function Button({
  children,
  onClick,
  disabled = false,
  primary = false,
  variant,
  "aria-label": ariaLabel,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  variant?: "primary" | "secondary" | "quiet";
  "aria-label"?: string;
  type?: "submit" | "button";
}) {
  return (
    <button
      className={`${styles.button} ${primary || variant === "primary" ? styles.primary : ""} ${variant === "quiet" ? styles.quiet : ""}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  id: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([key, title]) => (
          <option value={key} key={key}>
            {title}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`${styles.status} ${error ? styles.error : ""}`}
    >
      {children}
    </p>
  );
}
export function Row({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <article className={styles.row}>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
      {action}
    </article>
  );
}
export const stateNames: Record<string, Localized> = {
  NEW: ["New account", "حساب جديد"],
  UNVERIFIED: ["Unverified", "غير مؤكد"],
  VERIFIED: ["Email verified", "البريد مؤكد"],
  SIGNED_IN: ["Simulated sign-in", "دخول محاكى"],
  SUSPENDED: ["Suspended", "موقوف"],
  RECEIVED: ["Received", "مستلم"],
  PROCESSING: ["Processing", "قيد المعالجة"],
  NEEDS_INFORMATION: ["Needs information", "يحتاج معلومات"],
  ACCEPTED: ["Accepted", "مقبول"],
  REJECTED: ["Rejected", "مرفوض"],
  COMPLETED: ["Completed", "مكتمل"],
  DRAFT: ["Draft", "مسودة"],
  PUBLISHED: ["Published", "منشور"],
  WITHDRAWN: ["Hidden", "مخفي"],
  LOCKED: ["Locked", "مغلق"],
  UNLOCKED: ["Unlocked", "مفتوح"],
  INACTIVE: ["Inactive", "غير نشط"],
  ACTIVE: ["Active", "نشط"],
  DEACTIVATED: ["Deactivated", "معطل"],
  FAILED: ["Failed", "فشل"],
  QUARANTINED: ["Quarantined", "معزول"],
  QUEUED: ["Queued", "في الانتظار"],
  STORED: ["Raw fixture stored", "مثال خام محفوظ"],
  HELD: ["Deletion on hold", "الحذف معلق"],
  DISABLED: ["Disabled", "معطل"],
  ENABLED: ["Enabled fixture", "مثال مفعل"],
  PENDING: ["Pending second founder", "بانتظار المؤسس الثاني"],
};
export function stateName(state: string, locale: Locale) {
  return text(stateNames[state] ?? [state, state], locale);
}
