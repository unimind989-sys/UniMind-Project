import { useContext } from "react";
import { createPortal } from "react-dom";
import { SegmentedControl } from "@/app/_components/segmented-control";

import { adminTargetKind } from "@/lib/admin/admin-presentation.application";
import type { Locale } from "@/lib/i18n/locale";
import { StatePill } from "@/app/_components/state-pill";

import styles from "../../admin.module.css";
import { AdminBandSlot } from "../admin-workspace";
import {
  candidateLabel,
  candidateState,
  candidateTone,
  type AdminCopy,
} from "./candidate-presentation";
import type { DecisionQueue } from "./use-decision-queue";

const queueFilters = [
  "all",
  "available",
  "pending",
  "blocked",
  "completed",
] as const;

/**
 * Count tabs (in the Night band when the workspace provides one) and the
 * searchable decision list. Every count is the length of the list it selects.
 */
export function DecisionListPane({
  locale,
  copy,
  queue,
}: Readonly<{
  locale: Locale;
  copy: AdminCopy;
  queue: DecisionQueue;
}>) {
  const { filtered, matching, selected, refreshing, group, selectCandidate } =
    queue;
  const slot = useContext(AdminBandSlot);
  const number = new Intl.NumberFormat(locale);
  // CountTabs (DESIGN.md): the Night SegmentedControl with real counts.
  const counts = (
    <SegmentedControl
      mode="buttons"
      tone="night"
      className={styles.countTabs}
      label={copy.filtersLabel}
      items={queueFilters.map((id) => ({
        key: id,
        pressed: queue.filter === id,
        onClick: () => queue.setFilter(id),
        label: (
          <>
            <span className={styles.countLabel}>{copy.filters[id]}</span>{" "}
            <span className={styles.countNumber}>
              {number.format(
                id === "all"
                  ? matching.length
                  : matching.filter((candidate) => group(candidate) === id)
                      .length,
              )}
            </span>
          </>
        ),
      }))}
    />
  );

  return (
    <section
      className={styles.queuePane}
      aria-label={locale === "ar" ? "قائمة القرارات" : "Decisions"}
    >
      {slot === undefined ? counts : slot ? createPortal(counts, slot) : null}
      <label className={styles.queueSearch}>
        <span>{locale === "ar" ? "البحث عن قرار" : "Find a decision"}</span>
        <input
          type="search"
          value={queue.search}
          onChange={(event) => queue.setSearch(event.target.value)}
        />
      </label>
      {filtered.length === 0 ? (
        <p role="status" className={styles.queueEmpty}>
          {locale === "ar"
            ? "لا توجد قرارات تطابق البحث."
            : "No decisions match this search."}
        </p>
      ) : null}
      <div className={styles.mobileDecision}>
        <label htmlFor="admin-decision">
          {locale === "ar" ? "اختر قرارًا" : "Choose a decision"}
        </label>
        <select
          id="admin-decision"
          name="decision"
          disabled={refreshing}
          value={selected?.candidateId ?? ""}
          onChange={(event) => selectCandidate(event.target.value)}
        >
          <option value="">
            {locale === "ar"
              ? "اختر قرارًا للمراجعة"
              : "Choose a decision to review"}
          </option>
          {filtered.map((candidate) => (
            <option key={candidate.candidateId} value={candidate.candidateId}>
              {copy.verbs[candidate.action]} {candidateLabel(candidate, locale)}{" "}
              ({candidateState(candidate, locale)})
            </option>
          ))}
        </select>
      </div>
      <ul className={styles.decisionList} id="decision-list">
        {filtered.map((candidate) => (
          <li key={candidate.candidateId}>
            <button
              className={styles.decisionButton}
              data-selected={candidate.candidateId === selected?.candidateId}
              type="button"
              disabled={refreshing}
              aria-pressed={candidate.candidateId === selected?.candidateId}
              onClick={() => selectCandidate(candidate.candidateId)}
            >
              <span className={styles.decisionVerb}>
                {copy.verbs[candidate.action]}
              </span>{" "}
              <span className={styles.decisionMain}>
                <span className={styles.decisionTarget} dir="auto">
                  {candidateLabel(candidate, locale)}
                </span>{" "}
                <span className={styles.decisionScope}>
                  {copy.targetKinds[adminTargetKind(candidate.action)]}
                </span>
              </span>{" "}
              <span className={styles.decisionSide}>
                <StatePill tone={candidateTone(candidate)}>
                  {candidateState(candidate, locale)}
                </StatePill>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
