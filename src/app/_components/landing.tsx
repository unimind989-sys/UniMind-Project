import Link from "next/link";
import type { CSSProperties } from "react";
import type { Route } from "next";
import { Source_Serif_4 } from "next/font/google";
import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import { LanguageSwitch } from "./language-switch";
// Shared landing tokens and resets load before the section modules.
import styles from "./landing.module.css";
import { WorkspacePreview } from "./landing-experience";
import { LandingIcon } from "./landing-icons";
import { AnswerMoment } from "./landing-moment";
import { Reveal } from "./landing-reveal";
import sections from "./landing-sections.module.css";
import workspace from "./landing-workspace.module.css";

// The book face is only for the depicted printed handout (DESIGN.md).
const handoutFace = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-handout",
  display: "swap",
});

export function Landing({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const login = ("/login?lang=" + locale) as Route;
  const register = ("/register?lang=" + locale) as Route;
  return (
    <div
      className={`${styles.page} ${handoutFace.variable}`}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <a className={styles.skip} href="#landing-main">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <header className={styles.header}>
        <Brand href="/" locale={locale} tone="dark" />
        <nav
          className={styles.sectionNav}
          aria-label={t("Explore UniMind", "اكتشف UniMind")}
        >
          <a href="#workspace">{t("Try a sample", "جرّب نموذجًا")}</a>
          <a href="#how-it-works">{t("How it works", "كيف تعمل")}</a>
        </nav>
        <nav
          className={styles.accountNav}
          aria-label={t("Public navigation", "التنقل العام")}
        >
          <LanguageSwitch
            variant="link"
            locale={locale}
            hrefs={{ en: "/?lang=en", ar: "/?lang=ar" }}
          />
          <Link className={styles.signIn} href={login}>
            {t("Sign in", "تسجيل الدخول")}
          </Link>
        </nav>
      </header>
      <main id="landing-main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <h1 id="landing-title" lang="en" dir="ltr">
              <span>Study deeper</span> <span>Go further.</span>
            </h1>
            <p className={styles.lede}>
              {t(
                "Ask about your own lectures, in Arabic or English. UniMind answers only from your faculty’s material and shows you the page it came from.",
                "اسأل عن محاضراتك أنت، بالعربي أو بالإنجليزي. يجيب UniMind من مواد كليتك المعتمدة فقط، ويريك الصفحة التي جاءت منها الإجابة.",
              )}
            </p>
            <div className={styles.actions}>
              <Link className={styles.start} href={register}>
                {t("Start studying", "ابدأ المذاكرة")}
              </Link>
              <a className={styles.quiet} href="#how-it-works">
                {t("See how it works", "شاهد كيف تعمل")}
              </a>
            </div>
            <ul className={styles.proof}>
              {[
                t(
                  "Answers only from your approved material",
                  "إجابات من موادك المعتمدة فقط",
                ),
                t(
                  "A page or timestamp behind every claim",
                  "صفحة أو توقيت وراء كل معلومة",
                ),
                t(
                  "Says so when your material doesn’t cover it",
                  "يخبرك عندما لا تغطي موادك سؤالك",
                ),
              ].map((rule) => (
                <li key={rule}>
                  <span className={styles.tick}>
                    <LandingIcon name="check" width="15" height="15" />
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <AnswerMoment locale={locale} />
        </section>
        <section
          className={workspace.experience}
          id="workspace"
          aria-labelledby="experience-title"
        >
          <Reveal className={styles.sectionHead}>
            <h2 id="experience-title">
              {t("Try it on a real subject.", "جرّبه على مادة حقيقية.")}
            </h2>
            <p>
              {t(
                "This sample uses invented Anatomy material. Open the evidence, flip a flashcard or answer a quiz question.",
                "يستخدم هذا النموذج مواد تشريح مُتخيَّلة. افتح الدليل أو اقلب بطاقة مذاكرة أو أجب عن سؤال اختبار.",
              )}
            </p>
          </Reveal>
          <Reveal>
            <WorkspacePreview locale={locale} />
          </Reveal>
        </section>
        <section className={sections.evidence} aria-labelledby="evidence-title">
          <Reveal className={sections.evidenceCopy}>
            <h2 id="evidence-title">
              {t(
                "Check every answer against your material.",
                "راجع كل إجابة على موادك.",
              )}
            </h2>
            <p>
              {t(
                "Each claim carries a numbered source. Open it to read the passage, the page or the moment in the recording. When your approved material doesn’t cover a question, UniMind says so instead of guessing.",
                "كل معلومة تحمل مصدرًا مرقّمًا. افتحه لتقرأ المقتطف أو الصفحة أو اللحظة في التسجيل. وعندما لا تغطي موادك المعتمدة سؤالًا، يخبرك UniMind بذلك بدلًا من التخمين.",
              )}
            </p>
            <a className={styles.textLink} href="#workspace">
              {t("Try the sample answer", "جرّب الإجابة التجريبية")}
            </a>
          </Reveal>
          <Reveal as="figure" className={sections.evidenceCards} stagger>
            <div
              className={sections.sourceCard}
              style={{ "--order": 0 } as CSSProperties}
            >
              <div className={sections.sourceHead}>
                <p>
                  <strong lang="en" dir="ltr">
                    Practical 3, Axilla and arm
                  </strong>
                  <span>{t("Recording", "تسجيل")}</span>
                </p>
                <span className={sections.locator}>18:42</span>
              </div>
              <blockquote lang="en" dir="ltr">
                Look at the position: arm medially rotated, forearm pronated,
                palm facing backwards. That’s the waiter’s tip.
              </blockquote>
            </div>
            <div
              className={sections.gapCard}
              style={{ "--order": 1 } as CSSProperties}
            >
              <p className={sections.gapQuestion}>
                {t("How is Erb’s palsy treated?", "إزاي بيتعالج شلل إرب؟")}
              </p>
              <p className={sections.gapReply}>
                {t(
                  "Your approved Anatomy material doesn’t cover treatment, so UniMind won’t guess. It can explain the injury and its signs from Lecture 6.",
                  "موادك المعتمدة في التشريح لا تغطي العلاج، لذلك لن يخمّن UniMind. يمكنه شرح الإصابة وعلاماتها من المحاضرة 6.",
                )}
              </p>
            </div>
            <figcaption style={{ "--order": 2 } as CSSProperties}>
              {t(
                "Sample evidence from invented material",
                "أدلة تجريبية من مواد مُتخيَّلة",
              )}
            </figcaption>
          </Reveal>
        </section>
        <section
          className={sections.how}
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <Reveal className={sections.howHead}>
            <h2 id="how-title">{t("How it works", "كيف تعمل")}</h2>
            <p>
              {t(
                "Start with the subject you’re studying. Your questions and study aids stay with its course material.",
                "ابدأ بالمادة التي تذاكرها. تبقى أسئلتك وأدوات مذاكرتك مع مواد مقررك.",
              )}
            </p>
            <Link className={styles.textLink} href={register}>
              {t("Create your account", "أنشئ حسابك")}
            </Link>
          </Reveal>
          <Reveal as="ol" className={sections.steps} stagger>
            {[
              [
                t("Choose your program", "اختر برنامجك الدراسي"),
                t(
                  "Select your program and academic year, then your term where needed. Your Study Shelf shows the subjects available to you.",
                  "حدد برنامجك وسنتك الدراسية، ثم الفصل الدراسي عند الحاجة. يعرض رف المذاكرة المواد المتاحة لك.",
                ),
              ],
              [
                t("Open a subject", "افتح مادة"),
                t(
                  "Read its approved material or ask a question in Chat. Open the supporting passage to check an answer.",
                  "اقرأ موادها المعتمدة أو اطرح سؤالًا في الدردشة. افتح المقتطف الداعم لمراجعة الإجابة.",
                ),
              ],
              [
                t("Practice with the same sources", "تدرّب من نفس المصادر"),
                t(
                  "Use Studio for study aids, then take a quiz and review the explanations for questions you missed.",
                  "استخدم الاستوديو لإعداد أدوات مذاكرة، ثم اختبر نفسك وراجع شرح الأسئلة التي أخطأت فيها.",
                ),
              ],
            ].map(([title, description], index) => (
              <li key={title} style={{ "--order": index } as CSSProperties}>
                <span className={sections.stepNumber} aria-hidden="true">
                  {new Intl.NumberFormat(locale).format(index + 1)}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </Reveal>
        </section>
        <Reveal
          as="section"
          className={styles.closing}
          aria-labelledby="closing-title"
        >
          <h2 id="closing-title">
            {t("Open your next subject.", "افتح مادتك القادمة.")}
          </h2>
          <div className={styles.closingAction}>
            <p>
              {t(
                "Create an account to find the subjects available to you.",
                "أنشئ حسابًا للوصول إلى المواد المتاحة لك.",
              )}
            </p>
            <div className={styles.actions}>
              <Link className={styles.start} href={register}>
                {t("Create your account", "أنشئ حسابك")}
              </Link>
              <Link className={styles.quiet} href={login}>
                {t("Sign in", "تسجيل الدخول")}
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <footer className={styles.footer}>
        <Brand href="/" locale={locale} />
        <p>
          {t(
            "For learning from your course materials. Educational support does not replace professional advice.",
            "للتعلم من مواد مقررك. الدعم التعليمي لا يحل محل المشورة المتخصصة.",
          )}
        </p>
      </footer>
    </div>
  );
}
