"use client";

import { useRef } from "react";
import { Notice } from "@/app/_components/notice";
import { PageState } from "@/app/_components/page-state";

import type { AdminQueueState } from "@/lib/admin/admin-readiness.application";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import { submitAdminAction } from "../actions";
import styles from "../admin.module.css";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { AdminWorkspace } from "./admin-workspace";
import type { SubmitAdminAction } from "./decision-queue/candidate-presentation";
import { DecisionActionPanel } from "./decision-queue/decision-action-panel";
import { DecisionListPane } from "./decision-queue/decision-list-pane";
import { QueueNotice } from "./decision-queue/queue-notice";
import { useDecisionQueue } from "./decision-queue/use-decision-queue";

export function AdminDecisionQueue({
  initialLocale,
  queue,
  submitAction = submitAdminAction,
  reloadAction,
  embedded = false,
  refreshOnSelect = true,
  initialSelection,
  recheckComplete = false,
  onSelection,
}: Readonly<{
  initialLocale: Locale;
  queue: AdminQueueState;
  submitAction?: SubmitAdminAction;
  reloadAction?: () => void | Promise<void>;
  embedded?: boolean;
  refreshOnSelect?: boolean;
  initialSelection?: { id: string; error: boolean };
  recheckComplete?: boolean;
  onSelection?: (candidateId: string) => void;
}>) {
  const locale = initialLocale;
  const copy = getAdminCopy(locale);
  const direction = getTextDirection(locale);
  const candidates = queue.status === "READY" ? queue.candidates : [];
  const detail = useRef<HTMLDivElement>(null);
  const decisions = useDecisionQueue({
    candidates,
    locale,
    direction,
    copy,
    refreshOnSelect,
    initialSelection,
    reloadAction,
    onSelection,
    detail,
  });
  const { refreshing, selected } = decisions;
  const body = (
    <div className={styles.queue}>
      {recheckComplete && <p role="status">{copy.recheckDone}</p>}
      {decisions.selectionError && (
        <Notice tone="error" live locale={locale}>
          {copy.invalidSelection}
        </Notice>
      )}
      {queue.status === "FORBIDDEN" || queue.status === "UNAVAILABLE" ? (
        <QueueNotice
          status={queue.status}
          copy={copy}
          refreshing={refreshing}
          rechecked={decisions.rechecked}
          recheck={decisions.recheck}
        />
      ) : candidates.length === 0 ? (
        <PageState kind="empty" locale={locale} title={copy.emptyTitle}>
          <p>{copy.emptyBody}</p>
        </PageState>
      ) : (
        <div
          className={styles.queueLayout}
          data-detail-open={decisions.detailOpen}
        >
          <DecisionListPane locale={locale} copy={copy} queue={decisions} />
          <div className={styles.selectedDetail} ref={detail} tabIndex={-1}>
            {selected ? (
              <>
                <button
                  className={styles.detailBack}
                  type="button"
                  onClick={decisions.closeDetail}
                >
                  {locale === "ar"
                    ? "العودة إلى القرارات"
                    : "Back to decisions"}
                </button>
                <DecisionActionPanel
                  key={selected.candidateId}
                  candidate={selected}
                  locale={locale}
                  submitAction={submitAction}
                  refreshing={refreshing}
                  reloadAction={decisions.recheck}
                />
              </>
            ) : (
              <section className={styles.decisionEmpty}>
                <FrontendIcon name="shield" size={24} />
                <h2>
                  {locale === "ar"
                    ? "اختر قرارًا للمراجعة"
                    : "Choose a decision to review"}
                </h2>
                <p>
                  {locale === "ar"
                    ? "راجع الهدف والنتيجة قبل تسجيل أي تغيير."
                    : "Inspect its target and consequence before recording a change."}
                </p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
  return embedded ? (
    body
  ) : (
    <AdminWorkspace locale={locale}>{body}</AdminWorkspace>
  );
}
