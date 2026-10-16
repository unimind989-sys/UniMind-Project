import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import { StudyAtlas, WorkspacePreview } from "./landing-experience";
import { LandingIcon } from "./landing-icons";
import styles from "./landing.module.css";

export function Landing({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const login = ("/login?lang=" + locale) as Route;
  const register = ("/register?lang=" + locale) as Route;
  return (
    <div
      className={styles.page}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <a className={styles.skip} href="#landing-main">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <header className={styles.header}>
        <Brand href={"/?lang=" + locale} />
        <nav
          className={styles.sectionNav}
          aria-label={t("Explore UniMind", "اكتشف UniMind")}
        >
          <a href="#workspace">{t("The experience", "التجربة")}</a>
          <a href="#how-it-works">{t("How it works", "كيف تعمل")}</a>
        </nav>
        <nav
          className={styles.accountNav}
          aria-label={t("Public navigation", "التنقل العام")}
        >
          <Link
            className={styles.language}
            href={("/?lang=" + (locale === "en" ? "ar" : "en")) as Route}
            lang={locale === "en" ? "ar" : "en"}
          >
            {locale === "en" ? "العربية" : "English"}
          </Link>
          <Link className={styles.signIn} href={login}>
            {t("Sign in", "تسجيل الدخول")}
            <LandingIcon name="arrow" />
          </Link>
        </nav>
      </header>
      <main id="landing-main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <h1 id="landing-title" lang="en" dir="ltr">
              <span>Study deeper</span>{" "}
              <span className={styles.secondLine}>Go further.</span>
            </h1>
            <p className={styles.heroDescription}>
              {t(
                "Ask questions about your course material and check the sources behind each answer. Use the same material to make study aids and practice with quizzes.",
                "اسأل عن مواد مقررك وراجع المصادر التي تستند إليها كل إجابة. استخدم نفس المواد لإعداد أدوات مذاكرة والتدرب بالاختبارات.",
              )}
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primary} href={register}>
                {t("Start studying", "ابدأ المذاكرة")}
                <LandingIcon name="arrow" />
              </Link>
              <a className={styles.textLink} href="#workspace">
                {t("Try the workspace", "جرّب مساحة المذاكرة")}
                <LandingIcon name="arrow" />
              </a>
            </div>
            <p className={styles.heroNote}>
              <span className={styles.noteLine} aria-hidden="true" />
              {t(
                "Answers use your subject’s approved material.",
                "الإجابات تعتمد على المواد المعتمدة لمادتك.",
              )}
            </p>
          </div>
          <StudyAtlas locale={locale} />
        </section>
        <div className={styles.principleStrip}>
          <p>
            {t("Course material", "مواد المقرر")}
            <LandingIcon name="arrow" />
            <strong>
              {t("Answers you can check", "إجابات يمكنك مراجعتها")}
            </strong>
          </p>
          <span>
            {t(
              "Chat and Studio use the same sources.",
              "الدردشة والاستوديو يستخدمان نفس المصادر.",
            )}
          </span>
        </div>
        <section
          className={styles.experience}
          id="workspace"
          aria-labelledby="experience-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="experience-title">
              {t("Study with", "ذاكر من")}
              <br />
              <span>{t("your course material.", "مواد مقررك.")}</span>
            </h2>
            <p>
              {t(
                "Read a sample answer, flip a flashcard or try a quiz below. In your workspace, each tool uses your subject’s approved material.",
                "راجع الإجابة التجريبية أو اقلب بطاقة المذاكرة أو جرّب الاختبار أدناه. تعتمد أدوات مساحة المذاكرة على مواد مادتك المعتمدة.",
              )}
            </p>
          </div>
          <WorkspacePreview locale={locale} />
        </section>
        <section
          className={styles.evidenceSection}
          aria-labelledby="evidence-title"
        >
          <div className={styles.evidenceDiagram} aria-hidden="true">
            <div className={styles.diagramSource}>
              <LandingIcon name="source" />
              <span>{t("Your material", "مادتك الدراسية")}</span>
              <div className={styles.diagramLines}>
                <i />
                <i />
                <i />
              </div>
            </div>
            <svg
              className={styles.evidenceConnector}
              viewBox="0 0 340 180"
              fill="none"
            >
              <path
                d="M40 90H120C160 90 160 40 200 40H290M120 90c40 0 40 50 80 50h90"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="120" cy="90" r="5" fill="currentColor" />
              <circle cx="290" cy="40" r="5" fill="currentColor" />
              <circle cx="290" cy="140" r="5" fill="currentColor" />
            </svg>
            <div className={styles.diagramAnswer}>
              <LandingIcon name="chat" />
              <span>{t("An answer", "إجابة")}</span>
              <div className={styles.diagramCitation}>
                <LandingIcon name="check" />
                {t("Supporting evidence", "الأدلة الداعمة")}
              </div>
            </div>
            <div className={styles.diagramArtifact}>
              <LandingIcon name="studio" />
              <span>{t("A study aid", "أداة مذاكرة")}</span>
            </div>
          </div>
          <div className={styles.evidenceCopy}>
            <h2 id="evidence-title">
              {t("See what supports", "راجع ما تستند إليه")}
              <br />
              <span>{t("the answer.", "الإجابة.")}</span>
            </h2>
            <p>
              {t(
                "Open an answer’s supporting material to read the passage it uses. If the approved sources do not cover your question, UniMind tells you.",
                "افتح المادة الداعمة للإجابة لقراءة المقتطف الذي تعتمد عليه. إذا لم تغطِ المصادر المعتمدة سؤالك، يوضح لك UniMind ذلك.",
              )}
            </p>
            <a className={styles.textLink} href="#workspace">
              {t("Try the sample answer", "جرّب الإجابة التجريبية")}
              <LandingIcon name="arrow" />
            </a>
          </div>
        </section>
        <section
          className={styles.how}
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className={styles.howIntro}>
            <h2 id="how-title">{t("How it works", "كيف تعمل")}</h2>
            <p>
              {t(
                "Start with the subject you’re studying. Your questions and study aids stay with its course material.",
                "ابدأ بالمادة التي تذاكرها. تبقى أسئلتك وأدوات مذاكرتك مع مواد مقررك.",
              )}
            </p>
            <Link className={styles.textLink} href={register}>
              {t("Create your account", "أنشئ حسابك")}
              <LandingIcon name="arrow" />
            </Link>
          </div>
          <ol className={styles.steps}>
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
              <li key={title}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {new Intl.NumberFormat(locale, {
                    minimumIntegerDigits: 2,
                  }).format(index + 1)}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className={styles.cta} aria-labelledby="cta-title">
          <div className={styles.ctaMark} aria-hidden="true">
            <LandingIcon name="book" width="88" height="88" />
          </div>
          <h2 id="cta-title">
            {t("Open your next", "افتح مادتك")}
            <br />
            {t("subject.", "القادمة.")}
          </h2>
          <p>
            {t(
              "Create an account to find the subjects available to you.",
              "أنشئ حسابًا للوصول إلى المواد المتاحة لك.",
            )}
          </p>
          <Link className={styles.primary} href={register}>
            {t("Create your account", "أنشئ حسابك")}
            <LandingIcon name="arrow" />
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Brand href={"/?lang=" + locale} />
        <p>
          {t(
            "For learning from your course materials. Educational support does not replace professional advice.",
            "للتعلم من مواد مقررك. الدعم التعليمي لا يحل محل المشورة المتخصصة.",
          )}
        </p>
        <Link href={login}>
          {t("Sign in", "تسجيل الدخول")}
          <LandingIcon name="arrow" />
        </Link>
      </footer>
    </div>
  );
}
