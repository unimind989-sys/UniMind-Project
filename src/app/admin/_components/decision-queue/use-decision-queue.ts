import { useEffect, useState, useTransition, type RefObject } from "react";

import { useProductRouter } from "@/app/_components/product-navigation";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import { adminDecisionGroup } from "@/lib/admin/admin-presentation.application";
import type { Locale, TextDirection } from "@/lib/i18n/locale";

import { candidateLabel, type AdminCopy } from "./candidate-presentation";

/**
 * Queue search, filter and selection state. Selecting a decision opens the
 * detail, moves focus to its heading and (optionally) refreshes server state so
 * the panel never acts on a stale version; recheck reloads an unavailable queue.
 * The caller owns the detail ref so render code never reads it from this result.
 */
export function useDecisionQueue({
  candidates,
  locale,
  direction,
  copy,
  refreshOnSelect,
  initialSelection,
  reloadAction,
  onSelection,
  detail,
}: Readonly<{
  candidates: readonly AdminActionCandidate[];
  locale: Locale;
  direction: TextDirection;
  copy: AdminCopy;
  refreshOnSelect: boolean;
  initialSelection?: { id: string; error: boolean } | undefined;
  reloadAction?: (() => void | Promise<void>) | undefined;
  onSelection?: ((candidateId: string) => void) | undefined;
  detail: RefObject<HTMLDivElement | null>;
}>) {
  const router = useProductRouter();
  const [refreshing, startRefresh] = useTransition();
  const [selectedId, setSelectedId] = useState(initialSelection?.id ?? "");
  const [detailOpen, setDetailOpen] = useState(Boolean(initialSelection?.id));
  const [selectionError, setSelectionError] = useState(
    initialSelection?.error ?? false,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const group = adminDecisionGroup;
  const matching = candidates.filter((candidate) =>
    `${copy.actions[candidate.action]} ${candidateLabel(candidate, locale)}`
      .toLocaleLowerCase(locale)
      .includes(search.trim().toLocaleLowerCase(locale)),
  );
  const filtered = matching.filter(
    (candidate) => filter === "all" || group(candidate) === filter,
  );
  const selected =
    candidates.find((candidate) => candidate.candidateId === selectedId) ??
    null;
  useEffect(() => {
    onSelection?.(selectedId);
  }, [selectedId, onSelection]);
  useEffect(() => {
    if (selectedId && detailOpen)
      detail.current
        ?.querySelector<HTMLElement>("#decision-detail-heading")
        ?.focus();
  }, [selectedId, detailOpen, detail]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);
  function selectCandidate(candidateId: string) {
    setSelectedId(candidateId);
    setSelectionError(false);
    setDetailOpen(true);
    requestAnimationFrame(() =>
      detail.current
        ?.querySelector<HTMLElement>("#decision-detail-heading")
        ?.focus(),
    );
    if (refreshOnSelect) startRefresh(() => router.refresh());
  }
  function closeDetail() {
    setDetailOpen(false);
    requestAnimationFrame(() => {
      const chooser = document.getElementById("admin-decision");
      if (chooser?.getClientRects().length) chooser.focus();
      else
        document
          .querySelector<HTMLElement>("#decision-list [aria-pressed='true']")
          ?.focus();
    });
  }
  const [rechecked, setRechecked] = useState(false);
  function recheck() {
    startRefresh(async () => {
      if (reloadAction) await reloadAction();
      else router.refresh();
      setRechecked(true);
    });
  }

  return {
    refreshing,
    detailOpen,
    selectionError,
    search,
    setSearch,
    filter,
    setFilter,
    group,
    matching,
    filtered,
    selected,
    selectCandidate,
    closeDetail,
    rechecked,
    recheck,
  };
}

export type DecisionQueue = ReturnType<typeof useDecisionQueue>;
