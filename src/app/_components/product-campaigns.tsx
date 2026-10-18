"use client";
import { useProductText } from "@/app/_components/product-copy";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import {
  demoCampaignId,
  makeSyntheticCampaign,
} from "@/lib/demo/synthetic-campaigns.application";
import {
  defaultScope,
  reviewBase,
  type Locale,
} from "@/lib/demo/synthetic-fixtures.application";
import { useProductServices } from "./product-services";
import { Notice } from "./notice";
import { Button, ProductLink } from "./product-ui";
import styles from "./product.module.css";

type Props = { screen: string; locale: Locale; scenario: string };

/** Synthetic Batch Leader invitation, denied invitation and campaign list. */
export function ProductCampaigns({ screen, locale, scenario }: Props) {
  const { state, update } = useProductServices();
  const accepted = state.invitationUsed;
  const t = useProductText(locale);
  const campaign = makeSyntheticCampaign(state, locale, demoCampaignId)!;
  if (["expired", "replayed"].includes(scenario))
    return (
      <section className={styles.panel}>
        <Notice tone="error" locale={locale}>
          {t(
            "The sample assignment or invitation is expired/already used. No campaign access can be granted. Request a new invitation from the admin in the real product.",
            "التكليف أو الدعوة التجريبية منتهية أو مستخدمة. لا يمكن منح وصول للحملة. اطلب دعوة جديدة من الإدارة في المنتج الحقيقي.",
          )}
        </Notice>
        {scenario === "expired" ? (
          <p>
            {t("Invitation expired", "انتهت الدعوة")}:{" "}
            {formatCollectionDate(locale, syntheticDemoTime.expiredAt)}
          </p>
        ) : null}
        <ProductLink href={reviewBase + "/batch-leader"} locale={locale}>
          {t("Return to campaigns", "العودة للحملات")}
        </ProductLink>
      </section>
    );
  if (screen === "invitation")
    return (
      <section className={styles.panel}>
        <h2>{campaign.name}</h2>
        <dl className={styles.facts}>
          <div>
            <dt>{t("Cohort", "المجموعة")}</dt>
            <dd>{campaign.cohortName}</dd>
          </div>
          <div>
            <dt>{t("Assignment expires", "ينتهي التكليف")}</dt>
            <dd>
              {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
                dateStyle: "medium",
                timeZone: "UTC",
              }).format(new Date(syntheticDemoTime.assignmentExpiresAt))}
            </dd>
          </div>
        </dl>
        <p>
          {t(
            "This is a synthetic invitation example. Accepting it only updates this demo.",
            "هذا مثال دعوة تجريبية. قبولها يحدّث العرض التجريبي فقط.",
          )}
        </p>
        <div className={styles.actions}>
          <Button
            variant="primary"
            disabled={accepted}
            onClick={() =>
              update((current) => ({ ...current, invitationUsed: true }))
            }
          >
            {t("Accept invitation", "قبول الدعوة")}
          </Button>
          <ProductLink href={reviewBase + "/batch-leader"} locale={locale}>
            {t("View campaigns", "عرض الحملات")}
          </ProductLink>
        </div>
        {accepted ? (
          <Notice tone="success" live locale={locale}>
            {t(
              "Invitation accepted · simulated. No real access granted.",
              "تمت مراجعة الدعوة داخل التبويب. لم يمنح وصول.",
            )}
          </Notice>
        ) : null}
      </section>
    );
  return (
    <>
      <p>
        {t(
          "This role sees only fixed sample assignments. No invitations or permissions are fabricated as real access.",
          "هذا الدور يعرض تكليفات تجريبية ثابتة فقط. لا يتم اعتبار الدعوات أو الصلاحيات وصولًا حقيقيًا.",
        )}
      </p>
      <ul className={styles.listRows}>
        <li className={styles.listRow}>
          <div>
            <h3>{campaign.name}</h3>
            <p>
              <bdi>
                {locale === "ar"
                  ? defaultScope.unitTitleAr
                  : defaultScope.unitTitleEn}
              </bdi>
              {t(", ", "، ")}
              {campaign.cohortName}
            </p>
            <p>
              {t(
                "Awaiting handout, recording or image with a rights declaration.",
                "بانتظار ملزمة أو تسجيل أو صورة بإقرار حقوق.",
              )}
            </p>
          </div>
          <ProductLink
            href={reviewBase + "/batch-leader/campaigns/" + demoCampaignId}
            locale={locale}
          >
            {t("Open assigned campaign", "فتح الحملة المسندة")}
          </ProductLink>
        </li>
        {state.campaignDraft ? (
          <li className={styles.listRow}>
            <div>
              <h3>{t("New campaign draft", "مسودة حملة محاكاة جديدة")}</h3>
              <p>
                {t(
                  "Admin draft exists, but no real assignment has been created. Review its invitation from Admin.",
                  "توجد مسودة إدارة، لكن لم ينشأ تكليف حقيقي. راجع دعوتها من الإدارة.",
                )}
              </p>
            </div>
          </li>
        ) : null}
      </ul>
    </>
  );
}
