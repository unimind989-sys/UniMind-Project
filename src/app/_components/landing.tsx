import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import { StudyAtlas, WorkspacePreview } from "./landing-experience";
import { LandingIcon } from "./landing-icons";
import styles from "./landing.module.css";

// Existing UniMind identity at an architectural scale; the folio connects material to evidence.
// Motion belongs to assembly and user-driven state changes, never a scroll gate.
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
                "Your course materials, a clearer place to study. Ask questions, follow the evidence and make study aids from the subjects you’re learning.",
                "مكان أوضح لمذاكرة موادك الدراسية. اطرح أسئلتك، وراجع الأدلة، وأعد أدوات مذاكرة من المواد التي تتعلمها.",
              )}
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primary} href={register}>
                {t("Start studying", "ابدأ المذاكرة")}
                <LandingIcon name="arrow" />
              </Link>
              <a className={styles.textLink} href="#workspace">
                {t("Explore the workspace", "اكتشف مساحة المذاكرة")}
                <LandingIcon name="arrow" />
              </a>
            </div>
            <p className={styles.heroNote}>
              <span className={styles.noteLine} aria-hidden="true" />
              {t(
                "Built around your course. Designed around you.",
                "مبني حول مقررك. مصمم من أجلك.",
              )}
            </p>
          </div>
          <StudyAtlas locale={locale} />
        </section>
        <div className={styles.principleStrip}>
          <p>
            {t("From information", "من المعلومات")}
            <LandingIcon name="arrow" />
            <strong>{t("to understanding.", "إلى الفهم.")}</strong>
          </p>
          <span>
            {t(
              "One subject. One connected workspace.",
              "مادة واحدة. مساحة مترابطة.",
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
              {t("Everything connects.", "كل شيء مترابط.")}
              <br />
              <span>{t("Understanding follows.", "والفهم يأتي بعدها.")}</span>
            </h2>
            <p>
              {t(
                "Keep your materials, questions and study aids together. Move between them without losing the thread.",
                "اجمع موادك وأسئلتك وأدوات مذاكرتك معًا. انتقل بينها دون أن تفقد تسلسل أفكارك.",
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
              {t("A little less guessing.", "حيرة أقل.")}
              <br />
              <span>{t("A lot more clarity.", "ووضوح أكبر.")}</span>
            </h2>
            <p>
              {t(
                "An answer is only the beginning. Follow its supporting evidence back to your approved course material, and see where the explanation comes from.",
                "الإجابة هي البداية فقط. تتبع أدلتها الداعمة إلى مواد مقررك المعتمدة، واعرف من أين جاء الشرح.",
              )}
            </p>
            <a className={styles.textLink} href="#workspace">
              {t("See the connection", "اكتشف الترابط")}
              <LandingIcon name="arrow" />
            </a>
          </div>
        </section>
        <section
          className={styles.how}
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <h2 id="how-title">
            {t("Find your focus.", "ابدأ تركيزك.")}
            <br />
            <span>{t("Then go further.", "وانطلق أبعد.")}</span>
          </h2>
          <ol className={styles.steps}>
            {[
              [
                t("Set your academic context", "حدد سياقك الدراسي"),
                t(
                  "Choose your program and study period once. Your Study Shelf brings the available subjects together.",
                  "اختر برنامجك وفترتك الدراسية مرة واحدة. يجمع رف المذاكرة المواد المتاحة لك.",
                ),
              ],
              [
                t("Open a subject", "افتح مادة"),
                t(
                  "Keep materials, questions, study aids and quizzes in the same workspace.",
                  "اجمع المواد والأسئلة وأدوات المذاكرة والاختبارات في نفس المساحة.",
                ),
              ],
              [
                t("Study with supporting evidence", "ذاكر مع أدلة داعمة"),
                t(
                  "Check the material behind an answer and return to what you were studying.",
                  "راجع المادة التي تستند إليها الإجابة ثم عد إلى ما كنت تذاكره.",
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
                <LandingIcon name="arrow" />
              </li>
            ))}
          </ol>
        </section>
        <section className={styles.cta} aria-labelledby="cta-title">
          <div className={styles.ctaMark} aria-hidden="true">
            <LandingIcon name="book" width="88" height="88" />
          </div>
          <h2 id="cta-title">
            {t("Make room", "امنح المذاكرة")}
            <br />
            {t("for your next idea.", "مساحة لأفكارك.")}
          </h2>
          <p>
            {t(
              "A clearer place for the subjects you’re learning.",
              "مكان أوضح للمواد التي تتعلمها.",
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
