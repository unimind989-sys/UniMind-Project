"use client";

import { ProductDialog } from "@/app/_components/product-dialog";
import { ProductLink } from "@/app/_components/product-ui";
import { useProductText } from "@/app/_components/product-copy";
import { useProductServices } from "@/app/_components/product-services";
import { defaultScope } from "@/app/_components/synthetic-fixtures";
import {
  studyPassage,
  type StudyPassageId,
} from "@/lib/study/study-passages.application";
import type { Locale } from "@/lib/i18n/locale";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import styles from "./product-study.module.css";

export function ProductSourceDialog({
  open,
  title,
  ids,
  scope,
  locale,
  libraryHref,
  onClose,
}: {
  open: boolean;
  title: string;
  ids: readonly StudyPassageId[];
  scope: WorkspaceScope;
  locale: Locale;
  libraryHref: string;
  onClose: () => void;
}) {
  const t = useProductText(locale);
  const { state } = useProductServices();
  const handoutActive =
    scope.unitId !== defaultScope.unitId || state.availability.sourceActive;
  return (
    <ProductDialog
      open={open}
      title={title}
      closeLabel={t("Close", "إغلاق")}
      onClose={onClose}
    >
      {open ? (
        <>
          <p>
            {t(
              "Processed excerpts only. Full file reading and audio playback are not available here.",
              "مقتطفات معالجة فقط. قراءة الملف الكامل وتشغيل الصوت غير متاحين هنا.",
            )}
          </p>
          {ids.map((id) => {
            const passage = studyPassage(id, locale);
            return passage ? (
              <section key={id} className={styles.excerpt}>
                <h3>{passage.title}</h3>
                <p>
                  <bdi>{passage.format}</bdi> · {passage.locator}
                </p>
                {id === "handout" && !handoutActive ? (
                  <p>
                    {t(
                      "Inactive · excluded from new requests",
                      "غير نشط · مستبعد من الطلبات الجديدة",
                    )}
                  </p>
                ) : null}
                <blockquote>{passage.text}</blockquote>
              </section>
            ) : null;
          })}
          <ProductLink href={libraryHref} locale={locale}>
            {t("Browse material library", "تصفح مكتبة المصادر")}
          </ProductLink>
        </>
      ) : null}
    </ProductDialog>
  );
}
