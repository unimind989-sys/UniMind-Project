"use client";
import type { Route } from "next";
import { useProductText } from "@/app/_components/product-copy";
import { FrontendIcon } from "@/app/_components/frontend-system";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import {
  Button,
  ProductLink,
  SubmitButton,
} from "@/app/_components/product-ui";
import type { Locale } from "@/lib/i18n/locale";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import styles from "../product-chat.module.css";

export type ChatSessionView = {
  id: string;
  number: number;
  title: string;
  replies: number;
};

/**
 * Chat's section of the unit menu: New session, privacy settings and the
 * unit's sessions. Real sessions are addresses (links with `aria-current`);
 * synthetic sessions live in the tab store, so they are pressed buttons.
 */
export function ChatSessionsMenu({
  locale,
  scope,
  base,
  sessions,
  selectedId,
  answering,
  sending,
  startAction,
  onStart,
  onSelect,
}: {
  locale: Locale;
  scope: WorkspaceScope;
  base: string;
  sessions: readonly ChatSessionView[];
  selectedId: string | undefined;
  answering: boolean;
  sending: boolean;
  /** Real routes start a session through the authorized Server Action. */
  startAction?: ((form: FormData) => void | Promise<void>) | undefined;
  onStart: () => void;
  onSelect: (session: ChatSessionView) => void;
}) {
  const t = useProductText(locale);
  const number = new Intl.NumberFormat(locale);
  const details = (session: ChatSessionView) => (
    <>
      <bdi>{session.title}</bdi>
      <span>
        {t("Session", "جلسة")} {number.format(session.number)}
      </span>
      {startAction ? null : (
        <span>
          {t("Replies", "الإجابات")}: {number.format(session.replies)}
        </span>
      )}
    </>
  );
  return (
    <div className={styles.sessionMenu}>
      <div className={styles.sessionActions}>
        {startAction ? (
          // A real form, so the Server Action re-authorizes the scope and its
          // redirect or not-found applies as a navigation.
          <form action={startAction} className={styles.sessionForm}>
            <input type="hidden" name="cohortId" value={scope.cohortId} />
            <input type="hidden" name="unitId" value={scope.unitId} />
            <input type="hidden" name="locale" value={locale} />
            {/* Pending while the action runs, so a double press cannot start
                two durable sessions (IX-04). */}
            <SubmitButton
              variant="secondary"
              pendingLabel={t("Starting session…", "جارٍ بدء الجلسة…")}
            >
              <FrontendIcon name="plus" />
              {t("New session", "جلسة جديدة")}
            </SubmitButton>
          </form>
        ) : (
          <Button onClick={onStart} disabled={sending}>
            <FrontendIcon name="plus" />
            {t("New session", "جلسة جديدة")}
          </Button>
        )}
        <ProductLink
          href="/settings?section=privacy"
          locale={locale}
          variant="quiet"
        >
          <FrontendIcon name="settings" />
          {t("Privacy settings", "إعدادات الخصوصية")}
        </ProductLink>
      </div>
      <details className={styles.historyList} open>
        <summary>
          {t(
            `Sessions in this ${scope.unitLabelSingularEn.toLowerCase()}`,
            `جلسات ${scope.unitLabelSingularAr}`,
          )}{" "}
          ({number.format(sessions.length)})
        </summary>
        {sessions.length ? (
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                {startAction ? (
                  <Link
                    href={
                      `${base}/chat?lang=${locale}&session=${encodeURIComponent(session.id)}` as Route
                    }
                    prefetch={false}
                    aria-current={
                      selectedId === session.id ? "page" : undefined
                    }
                    onClick={() => onSelect(session)}
                  >
                    {details(session)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-pressed={selectedId === session.id}
                    onClick={() => onSelect(session)}
                  >
                    {details(session)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {answering
              ? t(
                  "Your first message starts a session here.",
                  "أول رسالة تبدأ جلسة هنا.",
                )
              : t(
                  "Start a session to keep your study here.",
                  "ابدأ جلسة للاحتفاظ بمذاكرتك هنا.",
                )}
          </p>
        )}
      </details>
    </div>
  );
}
