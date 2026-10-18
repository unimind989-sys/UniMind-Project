"use client";

import type { Route } from "next";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { MouseEventHandler, ReactNode, Ref } from "react";
import { useFormStatus } from "react-dom";
import {
  text,
  type Locale,
  type Localized,
} from "@/lib/demo/synthetic-fixtures.application";
import { localizedHref } from "@/lib/i18n/locale";
import { buttonLook, type ButtonLook } from "./button-look";
import { Field } from "./field";

export type { ButtonLook } from "./button-look";

/**
 * Action link: navigation that looks like a Button (DESIGN.md "Button /
 * action link"; anchors for navigation). The interface language is kept.
 */
export function ProductLink({
  href,
  locale,
  children,
  variant = "secondary",
  tone,
  size,
  block,
  className,
  "aria-current": current,
  "aria-describedby": describedBy,
  onClick,
}: ButtonLook & {
  href: string;
  locale: Locale;
  children: ReactNode;
  className?: string | undefined;
  "aria-current"?: "page" | undefined;
  "aria-describedby"?: string | undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}) {
  return (
    <Link
      {...buttonLook({ variant, tone, size, block }, className)}
      href={localizedHref(href, locale) as Route}
      prefetch={false}
      aria-current={current}
      aria-describedby={describedBy}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </Link>
  );
}

type ButtonProps = ButtonLook & {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean | undefined;
  /** Shows `pendingLabel` (or the label), sets `aria-busy` and disables. */
  pending?: boolean | undefined;
  pendingLabel?: ReactNode;
  type?: "submit" | "button";
  className?: string | undefined;
  form?: string | undefined;
  name?: string | undefined;
  value?: string | undefined;
  ref?: Ref<HTMLButtonElement> | undefined;
  "aria-label"?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-pressed"?: boolean | undefined;
  "aria-expanded"?: boolean | undefined;
  "aria-controls"?: string | undefined;
};

/** `Button` (DESIGN.md): primary, secondary, quiet and destructive on paper,
 * Night or Cobalt planes, with a pending state and one disabled look. */
export function Button({
  children,
  variant = "secondary",
  tone,
  size,
  block,
  pending = false,
  pendingLabel,
  disabled = false,
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...buttonLook({ variant, tone, size, block }, className)}
      {...rest}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/** A form's submit Button that shows its pending label while the form's
 * action runs (`useFormStatus`), so a second press cannot submit twice. */
export function SubmitButton({
  pendingLabel,
  pending: forcedPending = false,
  ...props
}: Omit<ButtonProps, "type"> & { pendingLabel: ReactNode }) {
  const status = useFormStatus();
  return (
    <Button
      variant="primary"
      {...props}
      type="submit"
      pending={status.pending || forcedPending}
      pendingLabel={pendingLabel}
    />
  );
}

/** A native select inside a `Field` (label, optional hint and error). */
export function Select({
  label,
  value,
  onChange,
  options,
  id,
  disabled = false,
  hint,
  error,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  id: string;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string | undefined;
}) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      {(control) => (
        <select
          {...control}
          name={id}
          value={value}
          disabled={disabled}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map(([key, title]) => (
            <option value={key} key={key}>
              {title}
            </option>
          ))}
        </select>
      )}
    </Field>
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
