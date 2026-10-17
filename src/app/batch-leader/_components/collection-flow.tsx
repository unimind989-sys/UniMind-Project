"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { collectionRequestProgress } from "@/lib/collection/collection-presentation.application";
import { CollectionHistory, collectionWindowMessage } from "./leader-home";
import { CollectionDeadline } from "./collection/collection-deadline";
import { CollectionProgress } from "./collection/collection-progress";
import { CollectionIntake } from "./collection/collection-intake";
import { CollectionRequests } from "./collection/collection-requests";
import { collectionText } from "./collection/collection-text";
import { CollectionUnavailable } from "./collection/collection-unavailable";
import {
  useCollectionFlow,
  type CollectionFlowProps,
} from "./collection/use-collection-flow";
import { useCollectionClock } from "./use-collection-clock";
import styles from "../collection.module.css";

export type { CollectionUploadClient } from "./collection-upload-client";

export function CollectionFlow(props: CollectionFlowProps) {
  const {
    campaign,
    locale,
    reference,
    dateReference,
    referenceTime,
    correction: initialCorrection,
  } = props;
  const t = collectionText(locale);
  const flow = useCollectionFlow(props);
  const now = useCollectionClock(referenceTime);
  const {
    query,
    windowState,
    uploadSelection,
    receivedCount,
    acknowledgements,
    inspection,
    deadline,
    back,
    projection,
  } = flow;
  if (
    inspection.status === "UNAVAILABLE" ||
    uploadSelection.status === "UNAVAILABLE" ||
    ((query.has("request") || query.has("submission")) && !initialCorrection)
  )
    return (
      <AppShell
        locale={locale}
        role="leader"
        title={t("Request unavailable", "الطلب غير متاح")}
      >
        <CollectionUnavailable campaign={campaign} locale={locale} />
      </AppShell>
    );
  const progress = collectionRequestProgress(projection.campaign);
  return (
    <AppShell
      locale={locale}
      role="leader"
      title={t("Source intake", "استلام المصادر")}
    >
      <div className={`${styles.workspace} ${styles.requestWorkspace}`}>
        <header className={styles.band}>
          <div className={styles.bandText}>
            <Link
              className={styles.back}
              href={`${back}?lang=${locale}` as Route}
            >
              <FrontendIcon name="back" />
              {t("Source intake", "استلام المصادر")}
            </Link>
            <h1>{campaign.name}</h1>
            <p>{campaign.cohortName}</p>
          </div>
          <div className={styles.bandFacts}>
            <CollectionDeadline
              campaign={campaign}
              locale={locale}
              deadline={deadline}
              now={now}
              live={windowState === "ACTIVE"}
              dateReference={dateReference}
            />
            <CollectionProgress
              sent={progress.sent}
              total={progress.total}
              locale={locale}
            />
          </div>
        </header>
        {windowState !== "ACTIVE" ? (
          <p role="status" className={styles.windowNotice}>
            {collectionWindowMessage(windowState, locale)}
          </p>
        ) : null}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.receivedNotice}
          data-empty={receivedCount ? undefined : true}
        >
          {receivedCount
            ? `${t("Received files", "الملفات المستلمة")}: ${new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(receivedCount)}. ${t("Processing and review are separate; receipt does not make a file available to students.", "المعالجة والمراجعة خطوتان منفصلتان؛ الاستلام لا يجعل الملف متاحًا للطلاب.")}`
            : ""}
        </p>
        <CollectionRequests campaign={campaign} locale={locale} flow={flow} />
        <CollectionIntake
          campaign={campaign}
          locale={locale}
          reference={reference}
          flow={flow}
        />
        <CollectionHistory
          campaigns={[campaign]}
          acknowledgements={acknowledgements}
          compact
          {...(referenceTime ? { referenceTime } : {})}
          locale={locale}
          heading={t("Recorded submissions", "الإرسالات المسجلة")}
        />
      </div>
    </AppShell>
  );
}
