"use client";

import { useActionState, useEffect, useRef } from "react";

import type { CurrentTerms } from "@/lib/auth/auth-access.application";
import type {
  AuthActionResult,
  FieldErrorCode,
} from "@/lib/auth/auth-actions.application";
import { getAuthCopy } from "@/lib/i18n/auth-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import {
  acceptConsentAction,
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resendVerificationAction,
  updatePasswordAction,
  type AuthFormState,
} from "../actions";
import styles from "../auth.module.css";

export type AuthFormMode =
  "login" | "register" | "verify" | "forgot" | "reset" | "consent";

export type AuthNotice =
  | "suspended"
  | "disabled"
  | "expired_link"
  | "replayed_link"
  | "invalid_link"
  | "signed_out"
  | "check_email"
  | "unavailable";

const initialState: AuthFormState = {
  status: "SUCCESS",
  returnPath: "/learn",
};

const actions = {
  login: loginAction,
  register: registerAction,
  verify: resendVerificationAction,
  forgot: requestPasswordResetAction,
  reset: updatePasswordAction,
  consent: acceptConsentAction,
} as const;

function fieldMessage(
  code: FieldErrorCode,
  copy: ReturnType<typeof getAuthCopy>,
): string {
  const messages = {
    ACCEPTANCE_REQUIRED: copy.invalidInput,
    EMAIL_INVALID: copy.emailInvalid,
    PASSWORD_REQUIRED: copy.passwordRequired,
    PASSWORD_REQUIREMENTS: copy.passwordRequirements,
    PASSWORD_MISMATCH: copy.passwordMismatch,
  } satisfies Record<FieldErrorCode, string>;
  return messages[code];
}

function actionNotice(
  state: AuthActionResult,
  copy: ReturnType<typeof getAuthCopy>,
): string | null {
  const messages = {
    SUCCESS: null,
    CHECK_EMAIL: copy.checkEmail,
    INVALID_INPUT: copy.invalidInput,
    INVALID_CREDENTIALS: copy.invalidCredentials,
    RATE_LIMITED: copy.rateLimited,
    UNAVAILABLE: copy.unavailable,
  } satisfies Record<AuthActionResult["status"], string | null>;
  return messages[state.status];
}

function initialNoticeMessage(
  notice: AuthNotice | undefined,
  copy: ReturnType<typeof getAuthCopy>,
): string | null {
  if (notice === undefined) return null;
  const messages = {
    suspended: copy.suspended,
    disabled: copy.disabled,
    expired_link: copy.expiredLink,
    replayed_link: copy.replayedLink,
    invalid_link: copy.invalidLink,
    signed_out: copy.signedOut,
    check_email: copy.checkEmail,
    unavailable: copy.unavailable,
  } satisfies Record<AuthNotice, string>;
  return messages[notice];
}

function firstFieldError(
  state: AuthFormState,
  field: string,
  copy: ReturnType<typeof getAuthCopy>,
): string | null {
  const code = state.fieldErrors?.[field]?.[0];
  return code === undefined ? null : fieldMessage(code, copy);
}

function FieldIcon({ name }: Readonly<{ name: "email" | "lock" }>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "email" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : (
        <>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
      )}
    </svg>
  );
}

export function AuthForm({
  mode,
  locale,
  returnPath,
  notice,
  currentTerms,
}: Readonly<{
  mode: AuthFormMode;
  locale: Locale;
  returnPath: string;
  notice?: AuthNotice | undefined;
  currentTerms?: CurrentTerms | null | undefined;
}>) {
  const copy = getAuthCopy(locale);
  const direction = getTextDirection(locale);
  const [state, formAction, pending] = useActionState(
    actions[mode],
    initialState,
  );
  const summaryRef = useRef<HTMLDivElement>(null);
  const stateNotice = actionNotice(state, copy);
  const visibleNotice = stateNotice ?? initialNoticeMessage(notice, copy);
  const noticeIsInformational =
    state.status === "CHECK_EMAIL" ||
    (state.status === "SUCCESS" &&
      (notice === "check_email" || notice === "signed_out"));
  const title = {
    login: copy.signInTitle,
    register: copy.registerTitle,
    verify: copy.verifyTitle,
    forgot: copy.forgotTitle,
    reset: copy.resetTitle,
    consent: copy.consentTitle,
  }[mode];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  useEffect(() => {
    if (state.status !== "SUCCESS") summaryRef.current?.focus();
  }, [state.status]);

  const emailError = firstFieldError(state, "email", copy);
  const passwordError = firstFieldError(state, "password", copy);
  const confirmationError = firstFieldError(
    state,
    "passwordConfirmation",
    copy,
  );
  const acceptanceError = firstFieldError(state, "acceptance", copy);

  return (
    <section className={styles.formRegion} aria-labelledby={`${mode}-title`}>
      <h3 id={`${mode}-title`}>{title}</h3>
      {mode === "verify" ? <p>{copy.verifyHelp}</p> : null}
      {mode === "forgot" ? <p>{copy.recoveryHelp}</p> : null}
      {mode === "register" || mode === "reset" ? (
        <p>{copy.passwordHelp}</p>
      ) : null}
      {visibleNotice !== null ? (
        <div
          className={styles.formNotice}
          data-status={state.status}
          role={noticeIsInformational ? "status" : "alert"}
          tabIndex={-1}
          ref={summaryRef}
        >
          {visibleNotice}
        </div>
      ) : null}

      <form action={formAction} noValidate>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value={returnPath} />

        {mode !== "reset" && mode !== "consent" ? (
          <div className={styles.field}>
            <label htmlFor={`${mode}-email`}>{copy.email}</label>
            <span className={styles.inputFrame}>
              <FieldIcon name="email" />
              <input
                id={`${mode}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={emailError !== null}
                aria-describedby={
                  emailError === null ? undefined : `${mode}-email-error`
                }
                required
              />
            </span>
            {emailError !== null ? (
              <span id={`${mode}-email-error`} className={styles.fieldError}>
                {emailError}
              </span>
            ) : null}
          </div>
        ) : null}

        {mode === "login" || mode === "register" || mode === "reset" ? (
          <div className={styles.field}>
            <label htmlFor={`${mode}-password`}>{copy.password}</label>
            <span className={styles.inputFrame}>
              <FieldIcon name="lock" />
              <input
                id={`${mode}-password`}
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                aria-invalid={passwordError !== null}
                aria-describedby={
                  passwordError === null ? undefined : `${mode}-password-error`
                }
                required
              />
            </span>
            {passwordError !== null ? (
              <span id={`${mode}-password-error`} className={styles.fieldError}>
                {passwordError}
              </span>
            ) : null}
          </div>
        ) : null}

        {mode === "register" || mode === "reset" ? (
          <div className={styles.field}>
            <label htmlFor={`${mode}-password-confirmation`}>
              {copy.passwordConfirmation}
            </label>
            <span className={styles.inputFrame}>
              <FieldIcon name="lock" />
              <input
                id={`${mode}-password-confirmation`}
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={confirmationError !== null}
                aria-describedby={
                  confirmationError === null
                    ? undefined
                    : `${mode}-password-confirmation-error`
                }
                required
              />
            </span>
            {confirmationError !== null ? (
              <span
                id={`${mode}-password-confirmation-error`}
                className={styles.fieldError}
              >
                {confirmationError}
              </span>
            ) : null}
          </div>
        ) : null}

        {mode === "consent" ? (
          <div className={styles.consentBlock}>
            <dl className={styles.versionList}>
              <div>
                <dt>{copy.terms}</dt>
                <dd>{currentTerms?.termsVersion ?? "—"}</dd>
              </div>
              <div>
                <dt>{copy.privacy}</dt>
                <dd>{currentTerms?.privacyVersion ?? "—"}</dd>
              </div>
              <div>
                <dt>{copy.boundary}</dt>
                <dd>{currentTerms?.educationalBoundaryVersion ?? "—"}</dd>
              </div>
            </dl>
            <p className={styles.boundaryCopy}>{copy.boundaryBody}</p>
            <label className={styles.checkboxField}>
              <input
                name="acceptance"
                value="accepted"
                type="checkbox"
                aria-invalid={acceptanceError !== null}
                required
              />
              <span>{copy.acceptLabel}</span>
            </label>
            {acceptanceError !== null ? (
              <span className={styles.fieldError}>{acceptanceError}</span>
            ) : null}
          </div>
        ) : null}

        <button
          className={styles.primaryAction}
          type="submit"
          disabled={pending || (mode === "consent" && currentTerms == null)}
        >
          <span>
            {pending
              ? copy.loading
              : {
                  login: copy.signIn,
                  register: copy.register,
                  verify: copy.resend,
                  forgot: copy.sendReset,
                  reset: copy.updatePassword,
                  consent: copy.accept,
                }[mode]}
          </span>
          <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
        </button>
      </form>

      <div className={styles.secondaryActions}>
        {mode === "login" ? (
          <>
            <a href={`/forgot-password?lang=${locale}`}>{copy.forgotLink}</a>
            <a
              href={`/register?lang=${locale}&next=${encodeURIComponent(returnPath)}`}
            >
              {copy.registerLink}
            </a>
          </>
        ) : null}
        {mode !== "login" && mode !== "consent" ? (
          <a
            href={`/login?lang=${locale}&next=${encodeURIComponent(returnPath)}`}
          >
            {copy.loginLink}
          </a>
        ) : null}
      </div>
    </section>
  );
}
