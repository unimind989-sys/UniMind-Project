import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import { adminAlreadyInState } from "@/lib/admin/admin-presentation.application";
import type { Locale } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import {
  candidateLabel,
  candidateState,
  type AdminCopy,
} from "./candidate-presentation";
import type { DecisionQueue } from "./use-decision-queue";

const queueFilters = [
  ["all", "All", "الكل"],
  ["available", "Available", "متاح"],
  ["blocked", "Blocked", "محجوب"],
  ["pending", "Pending", "معلق"],
  ["completed", "Completed", "مكتمل"],
] as const;

/** Searchable, filterable decision list with a native chooser for mobile. */
export function DecisionListPane({
  candidates,
  locale,
  copy,
  queue,
}: Readonly<{
  candidates: readonly AdminActionCandidate[];
  locale: Locale;
  copy: AdminCopy;
  queue: DecisionQueue;
}>) {
  const { filtered, matching, selected, refreshing, group, selectCandidate } =
    queue;

  return (
    <section
      className={styles.queuePane}
      aria-labelledby="decision-list-heading"
    >
      <h2 id="decision-list-heading">
        {copy.decisionsHeading}{" "}
        <span className={styles.queueCountCompact}>
          (
          {new Intl.NumberFormat(locale).format(
            candidates.filter((candidate) => !adminAlreadyInState(candidate))
              .length,
          )}
          )
        </span>
      </h2>
      <label className={styles.queueSearch}>
        <span>{locale === "ar" ? "البحث عن قرار" : "Find a decision"}</span>
        <input
          type="search"
          value={queue.search}
          onChange={(event) => queue.setSearch(event.target.value)}
        />
      </label>
      <div
        className={styles.queueFilters}
        aria-label={locale === "ar" ? "تصفية القرارات" : "Filter decisions"}
      >
        {queueFilters.map(([id, en, ar]) => (
          <button
            key={id}
            type="button"
            aria-pressed={queue.filter === id}
            onClick={() => queue.setFilter(id)}
          >
            {locale === "ar" ? ar : en}{" "}
            <span>
              {new Intl.NumberFormat(locale).format(
                id === "all"
                  ? matching.length
                  : matching.filter((candidate) => group(candidate) === id)
                      .length,
              )}
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p role="status">
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
              {copy.actions[candidate.action]} ·{" "}
              {candidateLabel(candidate, locale)} ·{" "}
              {candidateState(candidate, locale)}
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
              <span className={styles.decisionAction}>
                {copy.actions[candidate.action]}
              </span>
              <span className={styles.decisionTarget}>
                {candidateLabel(candidate, locale)}
              </span>
              <span
                className={styles.listStatus}
                data-tone={
                  candidate.failedPredicates.length > 0 &&
                  !adminAlreadyInState(candidate)
                    ? "blocked"
                    : "ready"
                }
              >
                {candidateState(candidate, locale)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
