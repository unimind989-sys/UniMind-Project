"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useProductServices } from "@/app/_components/product-services";
import { StatePill } from "@/app/_components/state-pill";
import styles from "@/app/_components/product.module.css";
import {
  defaultScope,
  type Locale,
} from "@/lib/demo/synthetic-fixtures.application";
import {
  studyMaterialReading,
  studyPassage,
} from "@/lib/study/study-passages.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import type { StudySource } from "./study-sources";

/** Every material in the unit, with its availability and readable excerpt. */
export function MaterialLibrary({
  scope,
  locale,
  sources,
}: {
  scope: WorkspaceScope;
  locale: Locale;
  sources: readonly StudySource[];
}) {
  const { state } = useProductServices();
  const t = useProductText(locale);
  return (
    <div className={styles.materialLibrary}>
      {/* The excerpt limitation, said once for the whole list (MD-19). */}
      <p className={styles.materialsLimit}>
        {t(
          "Excerpts show processed passages only. Full file reading and audio playback are not available here.",
          "المقتطفات تعرض نصوصًا معالجة فقط. قراءة الملف الكامل وتشغيل الصوت غير متاحين هنا.",
        )}
      </p>
      {sources.map((source) => {
        const active = !(
          scope.unitId === defaultScope.unitId &&
          !state.availability.sourceActive &&
          source.segment.endsWith(":1")
        );
        const reading = studyMaterialReading(source.passageId, active, locale);
        const passage = studyPassage(source.passageId, locale);
        return (
          <article key={source.segment} className={styles.sourceRow}>
            <div className={styles.sourceIdentity}>
              <div className={styles.sourceTitle}>
                <bdi className={styles.sourceFormat}>{source.format}</bdi>
                <h3>{source.title}</h3>
              </div>
              <p>{source.locator}</p>
              <p>{reading.caption}</p>
            </div>
            {/* Availability is the norm; only the exception is labelled. */}
            {active ? null : (
              <StatePill tone="neutral">
                {t(
                  "INACTIVE sample · excluded from new requests",
                  "مثال غير نشط · مستبعد من الطلبات الجديدة",
                )}
              </StatePill>
            )}
            {reading.readable && passage ? (
              <details>
                <summary>{reading.action}</summary>
                <p>{passage.text}</p>
              </details>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
