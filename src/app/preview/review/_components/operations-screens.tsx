"use client";

import { useState } from "react";
import {
  actionFixtures,
  applySampleAvailability,
  defaultScope,
  defaultUnitPath,
  resourceNames,
  reviewBase,
  text,
  type Locale,
} from "../review-fixtures";
import styles from "../review.module.css";
import { useReview } from "./review-provider";
import {
  Button,
  Notice,
  ReviewLink,
  Row,
  Select,
  stateName,
} from "./review-ui";

type Props = { screen: string; locale: Locale; scenario: string };
export function OperationsScreen(props: Props) {
  if (props.screen === "campaign-list" || props.screen === "invitation")
    return <Campaigns {...props} />;
  if (props.screen === "collection") return <Collection {...props} />;
  if (props.screen === "decisions") return <Decisions {...props} />;
  return <Resource {...props} />;
}

function Campaigns({ screen, locale, scenario }: Props) {
  const { state } = useReview();
  const [accepted, setAccepted] = useState(false);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (["expired", "replayed"].includes(scenario))
    return (
      <section className={styles.panel}>
        <Notice error>
          {t(
            "The sample assignment or invitation is expired/already used. No campaign access can be granted. Request a new invitation from the admin in the real product.",
            "التكليف أو الدعوة التجريبية منتهية أو مستخدمة. لا يمكن منح وصول للحملة. اطلب دعوة جديدة من الإدارة في المنتج الحقيقي.",
          )}
        </Notice>
        <ReviewLink href={reviewBase + "/batch-leader"} locale={locale}>
          {t("Return to campaigns", "العودة للحملات")}
        </ReviewLink>
      </section>
    );
  if (screen === "invitation")
    return (
      <section className={styles.panel}>
        <h2>{t("Fixed expiring invitation", "دعوة ثابتة محدودة المدة")}</h2>
        <p>
          {t(
            "Synthetic Anatomy source call · one cohort and unit · sample expiry date",
            "حملة مصادر تشريح تجريبية · مجموعة ووحدة واحدة · تاريخ انتهاء تجريبي",
          )}
          :{" "}
          {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date("2026-10-10T20:00:00Z"))}
        </p>
        <p>
          {t(
            "This invitation example does not create an assignment, grant permissions or send email. Batch Leaders cannot publish, unlock cohorts, inspect student chats or change providers/cost controls.",
            "مثال الدعوة لا ينشئ تكليفًا أو يمنح صلاحيات أو يرسل بريدًا. منسق الدفعة لا ينشر أو يفتح مجموعات أو يطلع على محادثات الطلاب أو يغير المزودين والميزانية.",
          )}
        </p>
        <Button primary disabled={accepted} onClick={() => setAccepted(true)}>
          {t("Review sample invitation", "مراجعة الدعوة التجريبية")}
        </Button>
        {accepted ? (
          <Notice>
            {t(
              "Invitation reviewed in this tab. No access granted.",
              "تمت مراجعة الدعوة داخل التبويب. لم يمنح وصول.",
            )}
          </Notice>
        ) : null}
        <div className={styles.actions}>
          <ReviewLink href={reviewBase + "/batch-leader"} locale={locale}>
            {t("View fixed assigned campaign", "عرض الحملة المسندة الثابتة")}
          </ReviewLink>
        </div>
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
      <Row
        title={t("Synthetic Anatomy source call", "حملة مصادر تشريح تجريبية")}
        action={
          <ReviewLink
            href={reviewBase + "/batch-leader/campaigns/sample-campaign"}
            locale={locale}
          >
            {t("Open assigned campaign", "فتح الحملة المسندة")}
          </ReviewLink>
        }
      >
        <p>
          <bdi>
            {locale === "ar"
              ? defaultScope.unitTitleAr
              : defaultScope.unitTitleEn}
          </bdi>{" "}
          · {t("Fixed assigned example", "مثال تكليف ثابت")}
        </p>
        <p>
          {t(
            "Awaiting handout, recording or image with a rights declaration.",
            "بانتظار ملزمة أو تسجيل أو صورة بإقرار حقوق.",
          )}
        </p>
      </Row>
      {state.campaignDraft ? (
        <Row
          title={t("New simulated campaign draft", "مسودة حملة محاكاة جديدة")}
        >
          <p>
            {t(
              "Admin draft exists, but no real assignment has been created. Review its invitation from Admin.",
              "توجد مسودة إدارة، لكن لم ينشأ تكليف حقيقي. راجع دعوتها من الإدارة.",
            )}
          </p>
        </Row>
      ) : null}
      <ReviewLink
        href={reviewBase + "/batch-leader/invitation"}
        locale={locale}
      >
        {t("Review invitation example", "مراجعة مثال الدعوة")}
      </ReviewLink>
    </>
  );
}

function Collection({ locale, scenario }: Props) {
  const { state, update } = useReview();
  const [mode, setMode] = useState("file");
  const [format, setFormat] = useState("PDF");
  const [rights, setRights] = useState(false);
  const [stage, setStage] = useState<
    "idle" | "uploading" | "uploaded" | "cancelled" | "received"
  >("idle");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("PROCESSING");
  const [validation, setValidation] = useState("valid");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const latest = state.submissions.at(-1);
  if (["expired", "replayed"].includes(scenario))
    return (
      <section className={styles.panel}>
        <Notice error>
          {t(
            "The sample assignment expired. Submission is unavailable; no upload target exists.",
            "انتهى التكليف التجريبي. الإرسال غير متاح؛ لا توجد وجهة رفع.",
          )}
        </Notice>
        <ReviewLink href={reviewBase + "/batch-leader"} locale={locale}>
          {t("Back to campaigns", "العودة للحملات")}
        </ReviewLink>
      </section>
    );
  function begin() {
    if (!rights) {
      setError(
        t(
          "Confirm the fixed sample rights declaration before simulating submission.",
          "أكد إقرار حقوق المثال الثابت قبل محاكاة الإرسال.",
        ),
      );
      return;
    }
    if (validation !== "valid") {
      const errors: Record<string, readonly [string, string]> = {
        duplicate: [
          "This sample is already submitted. Choose a corrected new version; historical provenance is retained.",
          "المثال أرسل سابقًا. اختر إصدارًا جديدًا مصححًا؛ يحتفظ بالتتبع التاريخي.",
        ],
        checksum: [
          "Sample checksum mismatch. Retry the fixed sample; no bytes were uploaded.",
          "عدم تطابق بصمة المثال. أعد محاولة المثال الثابت؛ لم ترفع بيانات.",
        ],
        oversize: [
          "The sample exceeds the allowed file size. Choose the valid fixed fixture; no numeric policy is invented.",
          "المثال يتجاوز حجم الملف المسموح. اختر المثال الثابت الصالح؛ لا نخترع حدًا رقميًا.",
        ],
        type: [
          "Unsupported sample format. Use the PDF, WAV or PNG fixture.",
          "صيغة المثال غير مدعومة. استخدم مثال PDF أو WAV أو PNG.",
        ],
        rights: [
          "Sample rights are unknown or revoked. Submission remains blocked.",
          "حقوق المثال مجهولة أو ملغاة. الإرسال يظل محظورًا.",
        ],
      };
      setError(text(errors[validation]!, locale));
      return;
    }
    setError("");
    setStage(mode === "file" ? "uploading" : "uploaded");
  }
  function receive() {
    if (stage !== "uploaded") return;
    update((current) => ({
      ...current,
      submissions: [
        ...current.submissions,
        { id: current.submissions.length + 1, format, status: "RECEIVED" },
      ],
    }));
    setStage("received");
  }
  return (
    <>
      <p>
        {t(
          "Synthetic Anatomy source call. Submission is limited to this fixed campaign; no local file picker, arbitrary URL, storage link or real upload.",
          "حملة مصادر تشريح تجريبية. الإرسال محدود لهذه الحملة الثابتة؛ لا اختيار ملف محلي أو رابط عشوائي أو رابط تخزين أو رفع حقيقي.",
        )}
      </p>
      <Row title={t("Requested material", "المادة المطلوبة")}>
        <p>
          {t(
            "Handout / recording / diagram. Descriptive source title, rights and professor/source context are required.",
            "ملزمة / تسجيل / رسم. يلزم عنوان وصفي مع الحقوق وسياق المحاضر أو المصدر.",
          )}
        </p>
        <p>
          {t("Current requested-item status", "حالة العنصر المطلوب الحالية")}:{" "}
          <strong>
            {latest
              ? stateName(latest.status, locale)
              : t("Awaiting sample", "بانتظار المثال")}
          </strong>
        </p>
      </Row>
      <section className={styles.panel}>
        <h2>{t("Fixed submission inputs", "مدخلات إرسال ثابتة")}</h2>
        <div className={styles.form}>
          <Select
            id="submission-mode"
            label={t(
              "File or approved reference example",
              "مثال ملف أو مرجع معتمد",
            )}
            value={mode}
            options={[
              ["file", t("Preloaded synthetic file", "ملف تجريبي جاهز")],
              [
                "reference",
                t("Preloaded synthetic reference", "مرجع تجريبي جاهز"),
              ],
            ]}
            onChange={(value) => {
              setMode(value);
              setStage("idle");
            }}
          />
          <Select
            id="submission-format"
            label={t(
              "Requested type and sample format",
              "النوع المطلوب وصيغة المثال",
            )}
            value={format}
            options={[
              ["PDF", t("Handout · PDF", "ملزمة · PDF")],
              ["WAV", t("Recording · WAV", "تسجيل · WAV")],
              ["PNG", t("Diagram · PNG", "رسم · PNG")],
            ]}
            onChange={(value) => {
              setFormat(value);
              setStage("idle");
            }}
          />
          <label className={styles.field} htmlFor="source-title">
            {t("Source title · fixed", "عنوان المصدر · ثابت")}
            <input
              id="source-title"
              name="source-title"
              readOnly
              autoComplete="off"
              value={t("Synthetic study sequence", "ترتيب دراسة تجريبي")}
            />
          </label>
          <label className={styles.field} htmlFor="source-description">
            {t(
              "Professor or source description · fixed",
              "وصف المحاضر أو المصدر · ثابت",
            )}
            <textarea
              id="source-description"
              name="source-description"
              readOnly
              autoComplete="off"
              value={t(
                "Invented teaching fixture for reviewing the collection journey.",
                "مثال تعليمي خيالي لمراجعة مسار جمع المصادر.",
              )}
            />
          </label>
          <p>
            {mode === "reference"
              ? t(
                  "Approved-reference fixture: sample-reference-1 · matching campaign/type · invented checksum. No storage URL exists. Real reference policy depends on D-18.",
                  "مثال مرجع معتمد: sample-reference-1 · حملة ونوع متطابقان · بصمة خيالية. لا رابط تخزين. سياسة المرجع الحقيقي تعتمد على D-18.",
                )
              : t(
                  "Preloaded fixture bytes are simulated; no file content is read or transmitted.",
                  "بيانات الملف الجاهز محاكاة؛ لا تقرأ أو ترسل محتويات ملف.",
                )}
          </p>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={rights}
              onChange={(event) => setRights(event.target.checked)}
            />
            {t(
              "Acknowledge the fixed synthetic rights declaration",
              "الإقرار بحقوق المثال التجريبي الثابت",
            )}
          </label>
          <Select
            id="submission-validation"
            label={t("Sample validation outcome", "نتيجة التحقق التجريبية")}
            value={validation}
            onChange={setValidation}
            options={[
              ["valid", t("Valid", "صالح")],
              ["duplicate", t("Duplicate / replacement", "مكرر / استبدال")],
              ["checksum", t("Checksum mismatch", "بصمة غير متطابقة")],
              ["oversize", t("Oversized", "حجم زائد")],
              ["type", t("Forbidden type", "نوع ممنوع")],
              [
                "rights",
                t("Rights unknown or revoked", "حقوق مجهولة أو ملغاة"),
              ],
            ]}
          />
          {error ? <Notice error>{error}</Notice> : null}
          {stage === "idle" || stage === "cancelled" ? (
            <Button primary onClick={begin}>
              {stage === "cancelled"
                ? t("Retry sample submission", "إعادة محاولة الإرسال التجريبي")
                : t("Start simulated submission", "بدء الإرسال المحاكى")}
            </Button>
          ) : null}
          {stage === "uploading" ? (
            <>
              <label className={styles.field}>
                {t("Simulated upload progress", "تقدم رفع محاكى")}
                <progress className={styles.progress} max={100} value={50}>
                  50%
                </progress>
              </label>
              <div className={styles.actions}>
                <Button onClick={() => setStage("uploaded")}>
                  {t("Complete sample upload", "إكمال رفع المثال")}
                </Button>
                <Button onClick={() => setStage("cancelled")}>
                  {t("Cancel sample upload", "إلغاء رفع المثال")}
                </Button>
              </div>
            </>
          ) : null}
          {stage === "uploaded" ? (
            <Button primary onClick={receive}>
              {t("Simulate finalization", "محاكاة إنهاء الإرسال")}
            </Button>
          ) : null}
          {stage === "received" ? (
            <Notice>
              {t(
                "Simulated submission received. The requested-item and tracking record now show Received. No upload or server finalization occurred.",
                "استلم الإرسال المحاكى. العنصر المطلوب وسجل المتابعة يعرضان مستلم. لم يحدث رفع أو إنهاء على الخادم.",
              )}
            </Notice>
          ) : null}
          {stage === "cancelled" ? (
            <Notice>
              {t(
                "Sample upload cancelled. Nothing was transmitted. Retry uses the same sample inputs.",
                "ألغي رفع المثال. لم يرسل شيء. إعادة المحاولة تستخدم نفس المدخلات.",
              )}
            </Notice>
          ) : null}
        </div>
      </section>
      <section>
        <h2>{t("Sample tracking", "متابعة تجريبية")}</h2>
        {state.submissions.length === 0 ? (
          <p>{t("No sample submissions yet.", "لا إرسالات تجريبية بعد.")}</p>
        ) : (
          state.submissions.map((submission) => (
            <Row
              key={submission.id}
              title={
                t("Sample submission ", "إرسال تجريبي ") +
                new Intl.NumberFormat(locale).format(submission.id)
              }
            >
              <p>
                <bdi>{submission.format}</bdi> ·{" "}
                {stateName(submission.status, locale)}
              </p>
              {submission.status === "NEEDS_INFORMATION" ? (
                <p>
                  {t(
                    "Sample request: confirm source context, then submit a corrected fixture.",
                    "طلب تجريبي: أكد سياق المصدر ثم أرسل مثالًا مصححًا.",
                  )}
                </p>
              ) : submission.status === "REJECTED" ? (
                <p>
                  {t(
                    "Sample rejected: unsupported rights. Historical record retained; submit a permitted replacement.",
                    "مثال مرفوض: حقوق غير مدعومة. السجل محفوظ؛ أرسل بديلًا مسموحًا.",
                  )}
                </p>
              ) : submission.status === "COMPLETED" ? (
                <p>
                  {t(
                    "Fixture processing/deletion/indexing complete; illustrative, not durable storage or raw-deletion proof.",
                    "معالجة وحذف وفهرسة المثال مكتملة؛ توضيحية وليست إثباتًا لتخزين دائم أو حذف الخام.",
                  )}
                </p>
              ) : null}
            </Row>
          ))
        )}
        {latest ? (
          <div className={styles.form}>
            <Select
              id="tracking-state"
              label={t("Controlled fixture status", "حالة المثال المتحكم بها")}
              value={status}
              onChange={setStatus}
              options={[
                "RECEIVED",
                "PROCESSING",
                "NEEDS_INFORMATION",
                "ACCEPTED",
                "REJECTED",
                "COMPLETED",
              ].map((value) => [value, stateName(value, locale)])}
            />
            <Button
              onClick={() =>
                update((current) => ({
                  ...current,
                  submissions: current.submissions.map((submission) =>
                    submission.id === latest.id
                      ? { ...submission, status }
                      : submission,
                  ),
                }))
              }
            >
              {t(
                "Apply sample tracking state",
                "تطبيق حالة المتابعة التجريبية",
              )}
            </Button>
            <Button
              onClick={() => {
                setStage("idle");
                setError("");
              }}
            >
              {t("Prepare corrected sample", "تجهيز مثال مصحح")}
            </Button>
          </div>
        ) : null}
      </section>
    </>
  );
}

function Decisions({ locale, scenario }: Props) {
  const { state, update } = useReview();
  const [selected, setSelected] = useState<string>("hide");
  const [reason, setReason] = useState("review");
  const [outcome, setOutcome] = useState(
    ["stale", "blocked", "pending", "disabled"].includes(scenario)
      ? scenario
      : "ready",
  );
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const action = actionFixtures.find((entry) => entry.id === selected)!;
  const sharedState = ["publish", "hide"].includes(action.id)
    ? state.availability.published
      ? "PUBLISHED"
      : "WITHDRAWN"
    : ["unlock", "lock"].includes(action.id)
      ? state.availability.unlocked
        ? "UNLOCKED"
        : "LOCKED"
      : ["activate", "deactivate"].includes(action.id)
        ? state.availability.sourceActive
          ? "ACTIVE"
          : "DEACTIVATED"
        : undefined;
  const currentState =
    (state.adminStates[action.id] === "PENDING" ? "PENDING" : sharedState) ??
    state.adminStates[action.id] ??
    (scenario === "pending" ? "PENDING" : action.before);
  function apply() {
    if (outcome === "stale" || outcome === "error") {
      setFeedback(
        outcome === "stale"
          ? t(
              "Simulated stale version. Refresh the fixture before retrying; no record changed.",
              "إصدار قديم محاكى. حدث المثال قبل إعادة المحاولة؛ لم يتغير سجل.",
            )
          : t(
              "Simulated action failed. Retry with Ready; no record changed.",
              "فشل الإجراء المحاكى. أعد المحاولة بنتيجة جاهز؛ لم يتغير سجل.",
            ),
      );
      return;
    }
    const pending = action.protected || outcome === "pending";
    const nextState = pending ? "PENDING" : action.after;
    update((entry) => ({
      ...entry,
      adminStates: { ...entry.adminStates, [action.id]: nextState },
      availability: pending
        ? entry.availability
        : applySampleAvailability(entry, action.id),
      audit: [
        ...entry.audit,
        [
          "Simulated " + action.label[0] + " · " + nextState,
          "محاكاة " + action.label[1] + " · " + stateName(nextState, "ar"),
        ],
      ],
    }));
    setFeedback(
      pending
        ? t(
            "Simulated first confirmation recorded. Pending a separate founder; this session cannot supply both confirmations.",
            "سجل التأكيد الأول المحاكى. بانتظار مؤسس آخر؛ الجلسة لا تقدم تأكيد المؤسسين.",
          )
        : t(
            "Simulated change applied to the local record. No protected action or real audit event occurred.",
            "طبق التغيير المحاكى على السجل المحلي. لم يحدث إجراء محمي أو تدقيق حقيقي.",
          ),
    );
  }
  return (
    <>
      <p>
        {t(
          "All twelve WP03 action types are represented. Local records and the sample journal update together. No real role, publication, source, hold, provider or budget changes.",
          "أمثلة لكل إجراءات WP03 الاثني عشر. السجلات المحلية والسجل التجريبي يتغيران معًا. لا يتغير دور أو نشر أو مصدر أو تعليق أو مزود أو ميزانية حقيقية.",
        )}
      </p>
      <Select
        id="admin-action"
        label={t("Governed action example", "مثال الإجراء المنضبط")}
        value={selected}
        onChange={(value) => {
          setSelected(value);
          setConfirmed(false);
          setFeedback("");
        }}
        options={actionFixtures.map((entry) => [
          entry.id,
          text(entry.label, locale),
        ])}
      />
      <section className={styles.panel}>
        <h2>{text(action.label, locale)}</h2>
        <dl className={styles.definition}>
          <div>
            <dt>{t("Exact sample scope", "نطاق المثال المحدد")}</dt>
            <dd>
              <bdi>
                {locale === "ar"
                  ? defaultScope.unitTitleAr
                  : defaultScope.unitTitleEn}
              </bdi>{" "}
              ·{" "}
              {t(
                "synthetic cohort; sample source version / flag as appropriate",
                "مجموعة تجريبية؛ إصدار مصدر أو علامة تجريبية حسب الإجراء",
              )}
            </dd>
          </div>
          <div>
            <dt>{t("Expected sample version", "الإصدار التجريبي المتوقع")}</dt>
            <dd>
              {t(
                "Version 2 · fixed fixture; stale outcomes reject before changing it",
                "الإصدار ٢ · مثال ثابت؛ الحالة القديمة ترفض قبل تغييره",
              )}
            </dd>
          </div>
          <div>
            <dt>{t("Current state", "الحالة الحالية")}</dt>
            <dd data-testid="admin-current-state">
              {stateName(currentState, locale)}
            </dd>
          </div>
          <div>
            <dt>{t("Proposed state", "الحالة المقترحة")}</dt>
            <dd>{stateName(action.after, locale)}</dd>
          </div>
          <div>
            <dt>{t("Consequences", "النتائج")}</dt>
            <dd>
              {t(
                "Only the synthetic record changes; no history is deleted. Real protected transitions require separate founder authority.",
                "يتغير السجل التجريبي فقط؛ لا يحذف تاريخ. الانتقالات المحمية الحقيقية تتطلب سلطة مؤسسين منفصلين.",
              )}
            </dd>
          </div>
        </dl>
        <Select
          id="action-reason"
          label={t("Fixed reason", "سبب ثابت")}
          value={reason}
          onChange={setReason}
          options={[
            [
              "review",
              t("Reviewed synthetic readiness", "مراجعة جاهزية تجريبية"),
            ],
            [
              "containment",
              t("Synthetic containment exercise", "تجربة احتواء تجريبية"),
            ],
          ]}
        />
        <Select
          id="action-outcome"
          label={t("Simulated decision outcome", "نتيجة القرار المحاكى")}
          value={outcome}
          onChange={(value) => {
            setOutcome(value);
            setFeedback("");
          }}
          options={[
            ["ready", t("Ready", "جاهز")],
            ["pending", t("Pending second founder", "بانتظار المؤسس الثاني")],
            ["blocked", t("Readiness blocked", "الجاهزية غير مكتملة")],
            ["stale", t("Stale version", "إصدار قديم")],
            ["error", t("Recoverable error", "خطأ قابل للاستعادة")],
            ["disabled", t("Approval missing", "الموافقة غير موجودة")],
          ]}
        />
        {outcome === "blocked" ? (
          <Notice error>
            {t(
              "Sample readiness failure: no active READY source / source rights not current. Release stays blocked.",
              "فشل جاهزية المثال: لا مصدر نشط جاهز أو حقوق غير سارية. النشر يظل محظورًا.",
            )}
          </Notice>
        ) : null}
        {action.id === "enable" || outcome === "disabled" ? (
          <Notice>
            {t(
              "Enablement is unavailable. Provider, rights, budget and financial approvals remain open. This mock cannot enable a provider or nonzero cap.",
              "التفعيل غير متاح. موافقات المزود والحقوق والميزانية والإنفاق مفتوحة. المحاكاة لا تفعل مزودًا أو حدًا ماليًا غير صفري.",
            )}
          </Notice>
        ) : null}
        {action.id === "hold" ? (
          <p>
            {t(
              "Sample hold reason: processing review; sample expiry: 10 October 2026. No real raw object or approved hold policy is implied.",
              "سبب تعليق تجريبي: مراجعة المعالجة؛ انتهاء تجريبي: ١٠ أكتوبر ٢٠٢٦. لا يعني ملفًا خامًا أو سياسة تعليق حقيقية معتمدة.",
            )}
          </p>
        ) : null}
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          {t(
            "Review this exact simulated state change and reason",
            "مراجعة تغيير الحالة المحاكى وسببه",
          )}
        </label>
        <div className={styles.actions}>
          <Button
            primary
            onClick={apply}
            disabled={
              !confirmed ||
              outcome === "blocked" ||
              outcome === "disabled" ||
              action.id === "enable" ||
              currentState === action.after ||
              currentState === "PENDING"
            }
          >
            {t("Simulate decision", "محاكاة القرار")}
          </Button>
          <Button
            onClick={() => {
              setConfirmed(false);
              setFeedback(
                t(
                  "Simulated decision cancelled. Local record unchanged.",
                  "ألغي القرار المحاكى. لم يتغير السجل المحلي.",
                ),
              );
            }}
          >
            {t("Cancel", "إلغاء")}
          </Button>
          {currentState === "PENDING" && action.id !== "enable" ? (
            <Button
              onClick={() => {
                update((entry) => ({
                  ...entry,
                  adminStates: {
                    ...entry.adminStates,
                    [action.id]: action.after,
                  },
                  availability: applySampleAvailability(entry, action.id),
                  audit: [
                    ...entry.audit,
                    [
                      "Fixed two-founder outcome fixture · " + action.label[0],
                      "مثال نتيجة مؤسسين ثابت · " + action.label[1],
                    ],
                  ],
                }));
                setFeedback(
                  t(
                    "Loaded the fixed completed two-founder outcome. This is a scenario fixture, not a second confirmation or access grant.",
                    "حمل مثال نتيجة مؤسسين مكتملة. هذا سيناريو ثابت وليس تأكيدًا ثانيًا أو منح وصول.",
                  ),
                );
              }}
            >
              {t(
                "Load completed outcome fixture",
                "تحميل مثال النتيجة المكتملة",
              )}
            </Button>
          ) : null}
        </div>
        {feedback ? <Notice>{feedback}</Notice> : null}
      </section>
      <section>
        <h2>{t("Local simulation journal", "سجل المحاكاة المحلي")}</h2>
        {state.audit.length ? (
          <ol className={styles.journal}>
            {state.audit.map((entry, index) => (
              <li key={index}>{text(entry, locale)}</li>
            ))}
          </ol>
        ) : (
          <p>{t("No simulated decisions yet.", "لا قرارات محاكاة بعد.")}</p>
        )}
      </section>
      <ReviewLink href={defaultUnitPath} locale={locale}>
        {t(
          "Preview exact sample student scope",
          "معاينة نطاق الطالب التجريبي المحدد",
        )}
      </ReviewLink>
    </>
  );
}

function Resource({ screen, locale }: Props) {
  const { state, update } = useReview();
  const [step, setStep] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [unitType, setUnitType] = useState("MODULE");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const resource = screen.slice(6) as keyof typeof resourceNames;
  if (!Object.hasOwn(resourceNames, resource)) return null;
  const summaries = {
    sources: [
      "Received → processed verification → independent raw absence proof → deletion audit → indexing → READY. Failed/low-confidence versions remain isolated. Every stage is a fixture, not executed processing; no raw data is exposed.",
      "استلام ← تحقق معالجة ← إثبات مستقل لغياب الخام ← تدقيق حذف ← فهرسة ← جاهز. الإصدارات الفاشلة أو منخفضة الثقة معزولة. كل مرحلة مثال وليست معالجة منفذة؛ لا بيانات خام.",
    ],
    jobs: [
      "Sample job: queued → running → retry wait → completed. A deletion-verification sample remains pending until durable output and independent absence proof. No worker runs; incomplete work cannot claim READY.",
      "مهمة تجريبية: انتظار ← تشغيل ← انتظار محاولة ← مكتمل. مثال تحقق الحذف ينتظر مخرجًا دائمًا وإثبات غياب مستقل. لا عامل يعمل؛ العمل الناقص لا يدعي الجاهزية.",
    ],
    quality: [
      "Sample report checks coverage, locator integrity, terminology and grounding. The recording conflicts with the handout; timing is missing. No academic or production PASS is claimed.",
      "تقرير تجريبي يفحص التغطية والمواضع والمصطلحات والأدلة. التسجيل يتعارض مع الملزمة والتوقيت ناقص. لا ندعي اجتيازًا أكاديميًا أو إنتاجيًا.",
    ],
    usage: [
      "Providers disabled; paid budget zero. Ready, unavailable allowance and delayed capacity examples have no invented numeric limits. No reservation, usage settlement, charge or provider call occurs.",
      "المزودون معطلون؛ الميزانية المدفوعة صفر. أمثلة جاهزية ورصيد غير متاح وسعة متأخرة دون حدود رقمية مختلقة. لا حجز أو تسوية أو رسوم أو اتصال بمزود.",
    ],
    incidents: [
      "Sample source-readiness incident is isolated. Containment may hide a unit, lock a cohort or disable a feature while retaining historical evidence. No alert or notification is sent.",
      "حادثة جاهزية مصدر تجريبية معزولة. الاحتواء قد يخفي وحدة أو يغلق مجموعة أو يعطل ميزة مع حفظ التاريخ. لا تنبيه أو إشعار يرسل.",
    ],
  } as const;
  return (
    <>
      <p>
        {t(
          "Synthetic resource view. Operations, configuration and processing are illustrative; no server resource is edited.",
          "عرض مورد تجريبي. العمليات والإعدادات والمعالجة توضيحية؛ لا يعدل مورد على الخادم.",
        )}
      </p>
      {resource === "catalog" ? (
        <section className={styles.panel}>
          <h2>{t("Catalog configuration example", "مثال إعداد الدليل")}</h2>
          <p>
            {t(
              "Stage → institution/system → program → level → period → cohort/edition → unit. Term-based and flexible-credit terminology comes from configuration.",
              "مرحلة ← مؤسسة أو نظام ← برنامج ← مستوى ← فترة ← مجموعة أو إصدار ← وحدة. المصطلحات من الإعدادات.",
            )}
          </p>
          <Select
            id="catalog-unit-type"
            label={t("Configured unit label", "اسم الوحدة من الإعدادات")}
            value={unitType}
            onChange={setUnitType}
            options={[
              ["MODULE", t("Module", "وحدة دراسية")],
              ["SUBJECT", t("Subject", "مادة دراسية")],
            ]}
          />
          <Button onClick={() => setStep(true)}>
            {t("Review fixed catalog draft", "مراجعة مسودة دليل ثابتة")}
          </Button>
          {step ? (
            <>
              <p>
                {t(
                  "Draft terminology only. No publication or membership changes.",
                  "مصطلحات مسودة فقط. لا تغيير نشر أو عضوية.",
                )}
              </p>
              <Button
                primary
                onClick={() =>
                  update((current) => ({
                    ...current,
                    catalogDraft: unitType === "SUBJECT" ? "SUBJECT" : "MODULE",
                  }))
                }
              >
                {t("Simulate saving draft", "محاكاة حفظ المسودة")}
              </Button>
            </>
          ) : null}
          {state.catalogDraft ? (
            <Notice>
              {t(
                "Sample catalog draft saved in memory. Publication remains governed separately.",
                "حفظت مسودة الدليل في الذاكرة. النشر منضبط بشكل منفصل.",
              )}{" "}
              {state.catalogDraft === "MODULE"
                ? t("Module", "وحدة دراسية")
                : t("Subject", "مادة دراسية")}
            </Notice>
          ) : null}
        </section>
      ) : resource === "cohorts" ? (
        <section className={styles.panel}>
          <h2>{t("Cohort configuration example", "مثال إعداد المجموعة")}</h2>
          <p>
            <bdi>{defaultScope.cohortName}</bdi> ·{" "}
            <bdi>{defaultScope.curriculumEdition}</bdi>
          </p>
          <p>
            {t(
              "Fixed cohort/edition draft. Membership, release, publication, READY sources, valid rights and matching edition remain separate availability predicates.",
              "مسودة مجموعة وإصدار ثابتة. العضوية والفتح والنشر والمصادر الجاهزة والحقوق والإصدار المتطابق شروط إتاحة منفصلة.",
            )}
          </p>
          <Button
            onClick={() =>
              update((current) => ({ ...current, cohortDraft: true }))
            }
          >
            {t("Simulate cohort draft", "محاكاة مسودة المجموعة")}
          </Button>
          {state.cohortDraft ? (
            <Notice>
              {t(
                "Sample cohort draft saved. No cohort unlocked.",
                "حفظت مسودة المجموعة. لم تفتح مجموعة.",
              )}
            </Notice>
          ) : null}
        </section>
      ) : resource === "campaigns" ? (
        <section className={styles.panel}>
          <h2>
            {t("Create scoped campaign example", "مثال إنشاء حملة محددة")}
          </h2>
          <p>
            {t(
              "Fixed name: Synthetic Anatomy source call. Handout, recording and diagram requests; fixed expiry, rights declaration and naming guidance.",
              "اسم ثابت: حملة مصادر تشريح تجريبية. طلبات ملزمة وتسجيل ورسم؛ انتهاء وحقوق وإرشادات تسمية ثابتة.",
            )}
          </p>
          <p>
            <bdi>{defaultScope.cohortName}</bdi> /{" "}
            <bdi>
              {locale === "ar"
                ? defaultScope.unitTitleAr
                : defaultScope.unitTitleEn}
            </bdi>
          </p>
          <Button
            primary
            onClick={() =>
              update((current) => ({ ...current, campaignDraft: true }))
            }
          >
            {t("Create sample campaign draft", "إنشاء مسودة حملة تجريبية")}
          </Button>
          {state.campaignDraft ? (
            <>
              <Notice>
                {t(
                  "Simulated campaign draft created in this tab.",
                  "أنشئت مسودة حملة محاكاة داخل التبويب.",
                )}
              </Notice>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                {t(
                  "Review fixed expiring campaign-only invitation",
                  "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
                )}
              </label>
              <Button
                disabled={!confirmed || state.invitation}
                onClick={() =>
                  update((current) => ({ ...current, invitation: true }))
                }
              >
                {t("Simulate invitation review", "محاكاة مراجعة الدعوة")}
              </Button>
              {state.invitation ? (
                <Notice>
                  {t(
                    "Invitation example reviewed. No email, assignment or access grant.",
                    "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
                  )}
                </Notice>
              ) : null}
              <ReviewLink
                href={reviewBase + "/batch-leader/invitation"}
                locale={locale}
              >
                {t(
                  "Open Batch Leader invitation example",
                  "فتح مثال دعوة منسق الدفعة",
                )}
              </ReviewLink>
            </>
          ) : null}
        </section>
      ) : (
        <section className={styles.panel}>
          <h2>{text(resourceNames[resource], locale)}</h2>
          <p>{text(summaries[resource], locale)}</p>
          {resource === "quality" ? (
            <ReviewLink href={defaultUnitPath + "/chat"} locale={locale}>
              {t("Inspect student conflict example", "فحص مثال تعارض الطالب")}
            </ReviewLink>
          ) : resource === "usage" ? (
            <ReviewLink
              href={defaultUnitPath + "/chat?state=capacity"}
              locale={locale}
            >
              {t("Preview capacity delay", "معاينة تأخير السعة")}
            </ReviewLink>
          ) : null}
        </section>
      )}
      <div className={styles.actions}>
        <ReviewLink href={reviewBase + "/admin"} locale={locale}>
          {t("Open governed decisions", "فتح القرارات المنضبطة")}
        </ReviewLink>
        <ReviewLink href={defaultUnitPath} locale={locale}>
          {t("Preview exact student scope", "معاينة نطاق الطالب المحدد")}
        </ReviewLink>
      </div>
    </>
  );
}
