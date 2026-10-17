"use client";
import type { ReactNode } from "react";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import {
  candidateState,
  stateLabel,
} from "@/app/admin/_components/decision-queue/candidate-presentation";
import adminStyles from "@/app/admin/admin.module.css";
import type { Locale } from "@/lib/i18n/locale";
import { StatePill, type StateTone } from "./state-pill";

const stateTones: Readonly<Record<string, StateTone>> = {
  PUBLISHED: "ok",
  UNLOCKED: "ok",
  ACTIVE: "ok",
  STORED: "ok",
  ENABLED: "ok",
  FAILED: "bad",
  NEEDS_REVIEW: "bad",
};

/** The pill for a governed target: a pending command, else its current state. */
export function targetState(candidate: AdminActionCandidate, locale: Locale) {
  return candidate.commandState
    ? { tone: "wait" as const, label: candidateState(candidate, locale) }
    : {
        tone: stateTones[candidate.currentState] ?? ("neutral" as const),
        label: stateLabel(candidate.currentState, locale),
      };
}

export type ResourceRow = {
  id: string;
  title: ReactNode;
  fields?: readonly (readonly [string, ReactNode])[];
  state?: { tone: StateTone; label: string };
  note?: ReactNode;
  actions?: ReactNode;
};

/** A working list on a surface: identity, structured fields, state, action. */
export function ResourceList({
  id,
  heading,
  rows,
}: {
  id: string;
  heading: string;
  rows: readonly ResourceRow[];
}) {
  return (
    <section aria-labelledby={id}>
      <div className={adminStyles.listHead}>
        <h2 id={id}>{heading}</h2>
      </div>
      <ul className={adminStyles.resourceList}>
        {rows.map((row) => (
          <li key={row.id}>
            <div className={adminStyles.rowMain}>
              <h3 className={adminStyles.rowTitle}>{row.title}</h3>
              {row.fields?.length ? (
                <dl className={adminStyles.rowFields}>
                  {row.fields.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {row.note ? (
                <p className={adminStyles.rowNote}>{row.note}</p>
              ) : null}
            </div>
            {row.state || row.actions ? (
              <div className={adminStyles.rowSide}>
                {row.state ? (
                  <StatePill tone={row.state.tone}>{row.state.label}</StatePill>
                ) : null}
                {row.actions}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
