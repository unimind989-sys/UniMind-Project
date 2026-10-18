"use client";

import type { ReactNode } from "react";
import { StatePill } from "@/app/_components/state-pill";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import {
  collectionTimeLeft,
  formatCollectionDate,
  formatCollectionTimeLeft,
} from "@/lib/i18n/collection-format";
import type { Locale } from "@/lib/i18n/locale";
import { collectionText } from "./collection-text";
import styles from "../../collection.module.css";

/** Time left before the leader's cutoff; urgency is text plus tone. */
export function CollectionTimeLeft({
  deadline,
  now,
  locale,
}: Readonly<{ deadline: string | null; now: number; locale: Locale }>) {
  const left = deadline ? collectionTimeLeft(deadline, now) : null;
  if (!left) return null;
  return (
    <StatePill
      icon="wait"
      tone={
        left.urgency === "urgent"
          ? "bad"
          : left.urgency === "soon"
            ? "wait"
            : "neutral"
      }
    >
      <span suppressHydrationWarning>
        {formatCollectionTimeLeft(locale, left)}
      </span>
    </StatePill>
  );
}

/** The dates behind the cutoff, kept one disclosure away. */
export function CollectionDateDetails({
  campaign,
  locale,
  dateReference,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  dateReference?: ReactNode;
}>) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  return (
    <details className={styles.deadlineDetails}>
      <summary>
        {t("Assignment and campaign dates", "مواعيد التكليف والحملة")}
      </summary>
      <div className={styles.deadlineBody}>
        {dateReference ? <p>{dateReference}</p> : null}
        <p>
          {text.assignment}:{" "}
          {formatCollectionDate(locale, campaign.assignmentExpiresAt)}
        </p>
        <p>
          {text.due}: {formatCollectionDate(locale, campaign.closesAt)}
        </p>
        <p>
          {t(
            "The earlier date is your upload cutoff. All dates use Cairo time.",
            "الموعد الأسبق هو آخر وقت متاح لك للرفع. كل المواعيد بتوقيت القاهرة.",
          )}
        </p>
      </div>
    </details>
  );
}

export function CollectionDeadline({
  locale,
  deadline,
  now,
  live,
}: Readonly<{
  locale: Locale;
  deadline: string | null;
  now: number;
  /** Only an open window counts down; closed windows explain themselves. */
  live: boolean;
}>) {
  const t = collectionText(locale);
  return (
    <aside className={styles.deadline} aria-labelledby="intake-deadline">
      <h2 id="intake-deadline">{t("Your deadline", "موعدك النهائي")}</h2>
      <p className={styles.deadlineValue}>
        <strong>
          {deadline
            ? formatCollectionDate(locale, deadline)
            : t("Unavailable", "غير متاح")}
        </strong>{" "}
        <span>{t("Cairo time", "بتوقيت القاهرة")}</span>
      </p>
      {live ? (
        <CollectionTimeLeft deadline={deadline} now={now} locale={locale} />
      ) : null}
    </aside>
  );
}
