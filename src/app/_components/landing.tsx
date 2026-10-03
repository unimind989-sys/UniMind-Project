import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import styles from "./landing.module.css";

export function Landing({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const login = `/login?lang=${locale}` as Route;
  const register = `/register?lang=${locale}` as Route;
  return (
    <div
      className={styles.page}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <header className={styles.header}>
        <Brand />
        <nav aria-label={t("Public navigation", "التنقل العام")}>
          <Link href={`/?lang=${locale === "en" ? "ar" : "en"}` as Route}>
            {locale === "en" ? "العربية" : "English"}
          </Link>
          <Link href={login}>{t("Sign in", "تسجيل الدخول")}</Link>
        </nav>
      </header>
      <main>
        <section className={styles.hero}>
          <div>
            <h1 lang="en" dir="ltr">
              Study deeper
              <br />
              Go further.
            </h1>
            <p>
              {t(
                "Your course materials, a clearer place to study. Ask questions, follow the evidence and make study aids from the subjects you’re learning.",
                "مكان أوضح لمذاكرة موادك الدراسية. اطرح أسئلتك، وراجع الأدلة، وأعد أدوات مذاكرة من المواد التي تتعلمها.",
              )}
            </p>
            <Link className={styles.primary} href={register}>
              {t("Start studying", "ابدأ المذاكرة")}
            </Link>
            <Link className={styles.secondary} href="#how-it-works">
              {t("How it works", "كيف تعمل")}
            </Link>
          </div>
          <figure className={styles.preview}>
            {(["light", "dark"] as const).map((theme) => (
              <Image
                key={theme}
                data-product-theme={theme}
                className={styles.productImage}
                src={`/images/product/studio-${locale}-${theme}.jpg`}
                width={1440}
                height={1000}
                alt={t(
                  "UniMind Anatomy workspace with Studio options and a sample study summary.",
                  "مساحة التشريح في UniMind مع خيارات الاستوديو وملخص مذاكرة تجريبي.",
                )}
                unoptimized
              />
            ))}
            <figcaption>
              {t(
                "Sample materials. Access and available tools depend on your subject.",
                "مواد تجريبية. الوصول والأدوات المتاحة يعتمدان على مادتك.",
              )}
            </figcaption>
          </figure>
        </section>
        <section className={styles.how} id="how-it-works">
          <h2>{t("A clear path through your course", "مسار واضح في مقررك")}</h2>
          <ol>
            <li>
              <h3>{t("Set your academic context", "حدد سياقك الدراسي")}</h3>
              <p>
                {t(
                  "Choose your program and study period once. Your Study Shelf brings the available subjects together.",
                  "اختر برنامجك وفترتك الدراسية مرة واحدة. يجمع رف المذاكرة المواد المتاحة لك.",
                )}
              </p>
            </li>
            <li>
              <h3>{t("Open a subject", "افتح مادة")}</h3>
              <p>
                {t(
                  "Keep materials, questions, study aids and quizzes in the same workspace.",
                  "اجمع المواد والأسئلة وأدوات المذاكرة والاختبارات في نفس المساحة.",
                )}
              </p>
            </li>
            <li>
              <h3>
                {t("Study with supporting evidence", "ذاكر مع أدلة داعمة")}
              </h3>
              <p>
                {t(
                  "Check the material behind an answer and return to what you were studying.",
                  "راجع المادة التي تستند إليها الإجابة ثم عد إلى ما كنت تذاكره.",
                )}
              </p>
            </li>
          </ol>
        </section>
        <section className={styles.cta}>
          <h2>
            {t("Make room for focused study", "امنح المذاكرة مساحة للتركيز")}
          </h2>
          <Link className={styles.primary} href={register}>
            {t("Create your account", "أنشئ حسابك")}
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Brand />
        <p>
          {t(
            "For learning from your course materials. Educational support does not replace professional advice.",
            "للتعلم من مواد مقررك. الدعم التعليمي لا يحل محل المشورة المتخصصة.",
          )}
        </p>
        <Link href={login}>{t("Sign in", "تسجيل الدخول")}</Link>
      </footer>
    </div>
  );
}
