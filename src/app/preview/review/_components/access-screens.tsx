"use client";

import { useState } from "react";
import { reviewBase, type Locale } from "../review-fixtures";
import styles from "../review.module.css";
import { useReview } from "./review-provider";
import { Button, Notice, ReviewLink, Select, stateName } from "./review-ui";

export function AccessScreen({
  screen,
  locale,
  scenario,
}: {
  screen: string;
  locale: Locale;
  scenario: string;
}) {
  const { state, update } = useReview();
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const expired = ["expired", "replayed"].includes(scenario);
  const account =
    scenario === "suspended"
      ? "SUSPENDED"
      : scenario === "unverified"
        ? "UNVERIFIED"
        : scenario === "verified"
          ? "VERIFIED"
          : state.account;
  const accepted =
    scenario === "current-consent" ||
    (scenario !== "outdated-consent" && state.consent);
  const next =
    screen === "register"
      ? "/verify-email"
      : screen === "verify-email"
        ? "/consent"
        : screen === "forgot-password"
          ? "/reset-password"
          : "/login";
  function simulate() {
    setDone(true);
    if (screen === "register") {
      update((current) => ({
        ...current,
        account: "UNVERIFIED",
        consent: false,
      }));
      setFeedback(
        t(
          "Simulated registration. The sample account is unverified; no email was sent.",
          "تمت محاكاة التسجيل. الحساب التجريبي غير مؤكد؛ لم يرسل بريد.",
        ),
      );
    } else if (screen === "verify-email") {
      update((current) => ({ ...current, account: "VERIFIED" }));
      setFeedback(
        t(
          "Simulated email verification. No real token or session was created.",
          "تمت محاكاة تأكيد البريد. لم ينشأ رمز أو جلسة حقيقية.",
        ),
      );
    } else if (screen === "consent") {
      update((current) => ({
        ...current,
        account: "SIGNED_IN",
        consent: true,
      }));
      setFeedback(
        t(
          "Sample commitments accepted in memory. This is not legal acceptance or authorization.",
          "تمت الموافقة على مثال الالتزامات في الذاكرة. ليست موافقة قانونية أو تصريح وصول.",
        ),
      );
    } else if (screen === "forgot-password") {
      update((current) => ({ ...current, recoveryUsed: false }));
      setFeedback(
        t(
          "Simulated recovery requested. A fixed recovery example is available below; no email was sent.",
          "تمت محاكاة طلب الاستعادة. مثال استعادة ثابت متاح بالأسفل؛ لم يرسل بريد.",
        ),
      );
    } else if (screen === "reset-password") {
      update((current) => ({ ...current, recoveryUsed: true }));
      setFeedback(
        t(
          "Simulated password reset completed. No credential changed; this example is now marked used.",
          "اكتملت محاكاة تغيير كلمة المرور. لم تتغير بيانات دخول؛ المثال أصبح مستخدمًا.",
        ),
      );
    } else {
      update((current) => ({ ...current, account: "SIGNED_IN" }));
      setFeedback(
        t(
          "Simulated sign-in only. No cookie, real session or protected access exists.",
          "دخول محاكى فقط. لا ملفات جلسة أو جلسة حقيقية أو وصول محمي.",
        ),
      );
    }
  }
  const suspended = account === "SUSPENDED";
  const recoveryConsumed =
    screen === "reset-password" && state.recoveryUsed && !done;
  return (
    <>
      <nav
        className={styles.actions}
        aria-label={t("Access steps", "خطوات الدخول")}
      >
        {[
          ["register", "Create account", "إنشاء حساب"],
          ["verify-email", "Verify email", "تأكيد البريد"],
          ["consent", "Commitments", "الالتزامات"],
          ["login", "Sign in", "الدخول"],
        ].map(([path, en, ar]) => (
          <ReviewLink
            key={path}
            href={`${reviewBase}/access/${path}`}
            locale={locale}
          >
            {t(en!, ar!)}
          </ReviewLink>
        ))}
      </nav>
      <section className={styles.panel}>
        <p>
          {t("Account fixture", "حالة الحساب التجريبي")}:{" "}
          <strong>{stateName(account, locale)}</strong>
        </p>
        {expired || recoveryConsumed ? (
          <>
            <Notice error>
              {t(
                "This sample link is expired or already used. Request a fresh example; no real recovery or invitation is accepted.",
                "رابط المثال منتهٍ أو مستخدم. اطلب مثالًا جديدًا؛ لا يتم قبول استعادة أو دعوة حقيقية.",
              )}
            </Notice>
            <ReviewLink
              href={`${reviewBase}/access/${screen === "verify-email" ? "verify-email" : "forgot-password"}`}
              locale={locale}
            >
              {t("Request fresh sample", "طلب مثال جديد")}
            </ReviewLink>
          </>
        ) : suspended ? (
          <>
            <Notice error>
              {t(
                "The sample account is suspended. Sign-in cannot continue; contact the administrator in the real product.",
                "الحساب التجريبي موقوف. لا يمكن متابعة الدخول؛ تواصل مع الإدارة في المنتج الحقيقي.",
              )}
            </Notice>
            <ReviewLink href={reviewBase} locale={locale}>
              {t("Return to review", "العودة للمراجعة")}
            </ReviewLink>
          </>
        ) : (
          <>
            <label className={styles.field} htmlFor="sample-email">
              {t("Sample email · fixed", "بريد تجريبي · ثابت")}
              <input
                id="sample-email"
                name="sample-email"
                type="email"
                readOnly
                value="learner@example.invalid"
                autoComplete="off"
                dir="ltr"
                spellCheck={false}
              />
            </label>
            {["register", "login", "reset-password"].includes(screen) ? (
              <p>
                {t(
                  "Password fields use a fixed masked example. No password is requested, stored or changed.",
                  "حقول كلمة المرور تستخدم مثالًا ثابتًا مخفيًا. لا نطلب أو نحفظ أو نغير كلمة مرور.",
                )}{" "}
                <bdi aria-label={t("Masked example", "مثال مخفي")}>
                  ••••••••••••
                </bdi>
              </p>
            ) : null}
            {screen === "consent" ? (
              <>
                <h2>
                  {t(
                    "Terms, privacy and educational use",
                    "الشروط والخصوصية والاستخدام التعليمي",
                  )}
                </h2>
                <p>
                  {t(
                    "Sample terms version, sample privacy version and sample educational-boundary version are shown for review. The real versioned disclosures are part of the functional consent flow.",
                    "نعرض إصدار شروط تجريبيًا وإصدار خصوصية تجريبيًا وإصدار حدود تعليمية للمراجعة. الإفصاحات الحقيقية ذات الإصدارات جزء من مسار الموافقة العامل.",
                  )}
                </p>
                <p>
                  {t(
                    "Saved chats are founder-visible by default. Private/no-sharing mode affects future exchanges; only qualifying reported, explicitly consented or policy-flagged exchanges may be reviewed, with audited access. Exact retention periods remain undecided.",
                    "المحادثات المحفوظة ظاهرة للمؤسسين افتراضيًا. وضع عدم المشاركة يؤثر على المحادثات القادمة؛ تقتصر المراجعة على المحادثات المؤهلة المبلغ عنها أو الموافق عليها أو المحددة بسياسة مع تدقيق الوصول. فترات الاحتفاظ لم تعتمد بعد.",
                  )}
                </p>
                <p>
                  {t(
                    "Academic learning only. No treatment of an identifiable real patient. This review records no legal consent.",
                    "للتعلم الأكاديمي فقط. لا علاج لمريض حقيقي محدد الهوية. المراجعة لا تسجل موافقة قانونية.",
                  )}
                </p>
                {accepted && !done ? (
                  <Notice>
                    {t(
                      "Current sample commitments are already accepted.",
                      "مثال الالتزامات الحالي تمت الموافقة عليه.",
                    )}
                  </Notice>
                ) : !accepted ? (
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                    />
                    {t(
                      "Acknowledge the sample commitments for this simulation",
                      "الإقرار بمثال الالتزامات لهذه المحاكاة",
                    )}
                  </label>
                ) : null}
              </>
            ) : screen === "login" && account === "UNVERIFIED" ? (
              <Notice error>
                {t(
                  "Verify the sample email before continuing.",
                  "أكد البريد التجريبي قبل المتابعة.",
                )}
              </Notice>
            ) : null}
            {!(screen === "login" && account === "UNVERIFIED") &&
            !(screen === "consent" && accepted) ? (
              <Button
                primary
                onClick={simulate}
                disabled={done || (screen === "consent" && !checked)}
              >
                {screen === "verify-email"
                  ? t("Simulate email verification", "محاكاة تأكيد البريد")
                  : screen === "consent"
                    ? t(
                        "Accept sample commitments",
                        "الموافقة على مثال الالتزامات",
                      )
                    : screen === "forgot-password"
                      ? t("Simulate recovery request", "محاكاة طلب الاستعادة")
                      : screen === "reset-password"
                        ? t(
                            "Simulate password reset",
                            "محاكاة تغيير كلمة المرور",
                          )
                        : screen === "register"
                          ? t(
                              "Register sample account",
                              "تسجيل الحساب التجريبي",
                            )
                          : t(
                              "Sign in with sample account",
                              "الدخول بالحساب التجريبي",
                            )}
              </Button>
            ) : null}
            {feedback ? <Notice>{feedback}</Notice> : null}
            <div className={styles.actions}>
              {done || (screen === "consent" && accepted) ? (
                <ReviewLink
                  href={
                    screen === "consent" || (screen === "login" && accepted)
                      ? reviewBase + "/catalog"
                      : screen === "login"
                        ? reviewBase + "/access/consent"
                        : reviewBase + "/access" + next
                  }
                  locale={locale}
                >
                  {screen === "consent" || (screen === "login" && accepted)
                    ? t("Open Study Shelf", "فتح رف المذاكرة")
                    : t("Next sample step", "الخطوة التجريبية التالية")}
                </ReviewLink>
              ) : null}
              {screen === "login" ? (
                <ReviewLink
                  href={reviewBase + "/access/forgot-password"}
                  locale={locale}
                >
                  {t("Forgot password", "نسيت كلمة المرور")}
                </ReviewLink>
              ) : null}
              {screen === "verify-email" ? (
                <Button
                  onClick={() =>
                    setFeedback(
                      t(
                        "Simulated resend. No email was sent.",
                        "محاكاة إعادة الإرسال. لم يرسل بريد.",
                      ),
                    )
                  }
                >
                  {t("Simulate resend", "محاكاة إعادة الإرسال")}
                </Button>
              ) : null}
              {screen === "login" && account === "UNVERIFIED" ? (
                <ReviewLink
                  href={reviewBase + "/access/verify-email"}
                  locale={locale}
                >
                  {t("Verify sample email", "تأكيد البريد التجريبي")}
                </ReviewLink>
              ) : null}
            </div>
          </>
        )}
      </section>
    </>
  );
}

export function SettingsScreen({ locale }: { locale: Locale }) {
  const { state, update } = useReview();
  const [feedback, setFeedback] = useState("");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <>
      <section className={styles.panel}>
        <h2>{t("Language", "اللغة")}</h2>
        <p>
          {t(
            "Use the language control above. It changes this review's interface; study outputs have their own sample language selection.",
            "استخدم اختيار اللغة بالأعلى. يغير لغة واجهة المراجعة؛ للمحتوى الدراسي اختيار لغة تجريبي مستقل.",
          )}
        </p>
      </section>
      <section className={styles.panel}>
        <h2>{t("Future exchange sharing", "مشاركة المحادثات القادمة")}</h2>
        <Select
          id="sharing-mode"
          label={t("Sample sharing mode", "وضع المشاركة التجريبي")}
          value={state.sharing}
          options={[
            [
              "shared",
              t("Founder-visible by default", "ظاهر للمؤسسين افتراضيًا"),
            ],
            ["private", t("Private / no sharing", "خاص / عدم مشاركة")],
          ]}
          onChange={(value) => {
            update((current) => ({
              ...current,
              sharing: value === "private" ? "private" : "shared",
            }));
            setFeedback(
              t(
                "Simulated preference changed for future sample exchanges only. Existing exchanges keep their recorded mode.",
                "تغير التفضيل المحاكى للمحادثات التجريبية القادمة فقط. تحتفظ المحادثات السابقة بوضعها المسجل.",
              ),
            );
          }}
        />
        <p>
          {t(
            "Private mode is separate from saving and retention. Qualifying reports, explicit consent and approved policy flags permit review of that exchange only. Real founder access must be audited.",
            "الوضع الخاص منفصل عن الحفظ والاحتفاظ. البلاغ المؤهل والموافقة الصريحة وعلامات السياسة المعتمدة تسمح بمراجعة المحادثة المعنية فقط. الوصول الحقيقي للمؤسسين يجب تدقيقه.",
          )}
        </p>
        {feedback ? <Notice>{feedback}</Notice> : null}
      </section>
      <section className={styles.panel}>
        <h2>
          {t(
            "Saving and retention · decision required",
            "الحفظ والاحتفاظ · يحتاج قرارًا",
          )}
        </h2>
        <p>
          {t(
            "D-08 has not approved retention periods, saving defaults or exact report retention/disclosure. These controls stay unavailable; no period or deletion behavior is invented. This tab's synthetic records disappear on reload/reset.",
            "D-08 لم يعتمد فترات الاحتفاظ أو افتراضات الحفظ أو تفاصيل احتفاظ وإفصاح البلاغات. هذه الخيارات غير متاحة؛ لا نخترع مدة أو سلوك حذف. سجلات التبويب التجريبية تختفي بإعادة التحميل أو الضبط.",
          )}
        </p>
        <Button disabled>
          {t(
            "Retention settings pending D-08",
            "إعدادات الاحتفاظ بانتظار D-08",
          )}
        </Button>
      </section>
      <section className={styles.panel}>
        <h2>{t("Sample account", "الحساب التجريبي")}</h2>
        <p>{stateName(state.account, locale)}</p>
        <div className={styles.actions}>
          <ReviewLink
            href={reviewBase + "/access/forgot-password"}
            locale={locale}
          >
            {t("Review recovery", "مراجعة الاستعادة")}
          </ReviewLink>
          <Button
            onClick={() => {
              update((current) => ({
                ...current,
                account: "NEW",
                consent: false,
              }));
              setFeedback(
                t(
                  "Simulated sign-out. No real session changed.",
                  "محاكاة الخروج. لم تتغير جلسة حقيقية.",
                ),
              );
            }}
          >
            {t("Simulate sign-out", "محاكاة تسجيل الخروج")}
          </Button>
        </div>
      </section>
    </>
  );
}
