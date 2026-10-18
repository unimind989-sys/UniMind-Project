"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import { buttonLook } from "@/app/_components/button-look";
import type { Route } from "next";
import { Button } from "@/app/_components/product-ui";
import { StatePill } from "@/app/_components/state-pill";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import { collectionRequestAction } from "@/lib/collection/collection-presentation.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { localizedHref, type Locale } from "@/lib/i18n/locale";
import { collectionText } from "./collection-text";
import type { CollectionFlowState } from "./use-collection-flow";
import styles from "../../collection.module.css";

export function CollectionRequests({
  campaign,
  locale,
  flow,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  flow: CollectionFlowState;
}>) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  const { windowState, queue, projection, outstanding, beginUpload } = flow;
  return (
    <section aria-labelledby="outstanding-requests">
      <div className={styles.requestHeading}>
        <h2 id="outstanding-requests">
          {t("Awaiting your action", "بانتظار إجراء منك")}{" "}
          <span className={styles.count}>
            {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(
              outstanding.length,
            )}
          </span>
        </h2>
        {windowState === "ACTIVE" ? (
          <Button
            variant="primary"
            disabled={queue.running || windowState !== "ACTIVE"}
            onClick={() => beginUpload(null)}
          >
            {t("Upload files", "رفع الملفات")}
          </Button>
        ) : null}
      </div>
      {outstanding.length ? (
        <ul className={styles.requestList}>
          {outstanding.map((item) => {
            const action = collectionRequestAction(projection.campaign, item);
            return (
              <li key={item.id} data-request-id={item.id}>
                <div className={styles.requestMain}>
                  <h3>{item.title}</h3>
                  <dl className={styles.facts}>
                    <div>
                      <dt>{t("Format", "الصيغة")}</dt>
                      <dd>
                        {item.expectedType === "DOCUMENT"
                          ? "PDF"
                          : item.expectedType === "AUDIO"
                            ? "WAV"
                            : item.expectedType === "IMAGE"
                              ? "PNG"
                              : t("Requested format", "الصيغة المطلوبة")}
                      </dd>
                    </div>
                    {!item.required ? (
                      <div>
                        <dt>{t("Request", "الطلب")}</dt>
                        <dd>{text.optional}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {item.latestSubmission?.correction ? (
                    <p className={styles.helper}>
                      {locale === "ar"
                        ? item.latestSubmission.correction.reasonAr
                        : item.latestSubmission.correction.reasonEn}
                    </p>
                  ) : null}
                </div>
                <div className={styles.requestSide}>
                  <StatePill tone={action === "UPLOAD" ? "neutral" : "bad"}>
                    {action === "UPLOAD"
                      ? t("Awaiting file", "بانتظار ملف")
                      : action === "FIX_INFORMATION"
                        ? t("Needs information", "يحتاج إلى معلومات")
                        : t("Needs a replacement", "يحتاج إلى استبدال")}
                  </StatePill>
                  {windowState === "ACTIVE" ? (
                    action === "UPLOAD" ? (
                      <Button
                        variant="secondary"
                        disabled={queue.running || windowState !== "ACTIVE"}
                        onClick={() => beginUpload(item.id)}
                      >
                        {t("Upload file", "رفع ملف")}
                      </Button>
                    ) : (
                      <Link
                        {...buttonLook({ variant: "primary" }, styles.open)}
                        href={
                          localizedHref(
                            `/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?request=${encodeURIComponent(item.id)}&submission=${encodeURIComponent(item.latestSubmission!.id)}#collection-intake`,
                            locale,
                          ) as Route
                        }
                      >
                        {action === "FIX_INFORMATION"
                          ? t("Fix information", "تصحيح المعلومات")
                          : t("Replace file", "استبدال الملف")}
                      </Link>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.allSent}>
          {t(
            "No request needs your action right now. Expand a recorded receipt to inspect processing and review status.",
            "لا يوجد طلب يحتاج إلى إجراء منك الآن. وسّع إيصالًا مسجلًا للاطلاع على حالة المعالجة والمراجعة.",
          )}
        </p>
      )}
    </section>
  );
}
