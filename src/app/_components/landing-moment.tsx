"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { LandingIcon } from "./landing-icons";
import styles from "./landing-moment.module.css";

/**
 * The L1 evidence moment (DESIGN.md "Public landing"): a student's question,
 * UniMind's answer, the matching page marker, the highlighter and the
 * professor's note arrive once on first view. Replay restarts it; reduced
 * motion shows the final composition. It never loops or follows the pointer.
 */
export function AnswerMoment({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (preference.matches) {
        element.dataset.moment = "still";
        return;
      }
      const showing = visible && !document.hidden;
      if (
        element.dataset.moment !== "playing" &&
        element.dataset.moment !== "done"
      )
        element.dataset.moment = showing ? "playing" : "waiting";
      element.dataset.paused = String(!showing);
    };
    const settle = () => {
      if (
        element.dataset.moment === "playing" &&
        element
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "finished")
      )
        element.dataset.moment = "done";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    element.addEventListener("animationend", settle);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("animationend", settle);
    };
  }, []);

  function replay() {
    const element = stage.current;
    if (!element || element.dataset.moment === "still") return;
    element.dataset.moment = "done";
    // Reading layout restarts the CSS animations from their first frame.
    void element.offsetWidth;
    element.dataset.moment = "playing";
  }

  return (
    <div
      className={styles.moment}
      ref={stage}
      data-moment="waiting"
      data-paused="true"
    >
      <div className={styles.composition}>
        <div className={styles.handout} lang="en" dir="ltr" aria-hidden="true">
          <div className={styles.handoutMeta}>
            <span>Anatomy, Lecture 6</span>
            <span>Year 1, Term 1</span>
          </div>
          <p className={styles.handoutTitle}>The brachial plexus</p>
          <p>
            The plexus is formed by the ventral rami of C5 to T1. The roots
            unite to form the upper, middle and lower trunks at the root of the
            neck.
          </p>
          <p className={styles.cited}>
            <span className={styles.marker} data-step="marker">
              1
            </span>
            <span className={styles.highlight}>
              Injury to the upper trunk (C5, C6) produces Erb–Duchenne
              paralysis, commonly from excessive separation of the head and
              shoulder
            </span>
            , as in a fall on the shoulder or a difficult delivery.
          </p>
          <svg
            className={styles.figure}
            viewBox="0 0 300 80"
            width="300"
            height="80"
          >
            <path
              d="M10 14h60M10 30h60M10 46h60M10 62h60M70 14c30 0 30 8 60 8M70 30c30 0 30-8 60-8M70 46c30 0 40 6 60 6M70 62c30 0 30-10 60-10M130 22c40 0 40 18 80 18M130 52c40 0 40-12 80-12M210 40h80"
              fill="none"
              stroke="#9aa9bb"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="70" cy="14" r="3.4" fill="#3977f7" />
            <circle cx="70" cy="30" r="3.4" fill="#3977f7" />
          </svg>
          <p>
            The lower trunk (C8, T1) is injured by excessive abduction of the
            arm, producing Klumpke’s paralysis of the small muscles of the hand.
          </p>
          <p>
            Lesions of the posterior cord paralyse the extensors of the elbow,
            wrist and fingers.
          </p>
          <span className={styles.pageNumber}>14</span>
        </div>
        <div className={styles.conversation} lang="ar" dir="rtl">
          <p className={styles.question} data-step="question">
            إيه اللي بيحصل لو الجذع العلوي للضفيرة العضدية اتصاب؟
          </p>
          <div className={styles.answer} data-step="answer">
            <p className={styles.answerFrom} lang="en" dir="ltr">
              UniMind
            </p>
            <p className={styles.answerText}>
              شلل إرب: يتأثر الجذران <bdi>C5</bdi> و<bdi>C6</bdi>، فيتدلى الذراع
              مقرّبًا ومدوّرًا للداخل في وضع «بقشيش النادل».
            </p>
            <ul className={styles.locations}>
              <li>
                <b>١</b>محاضرة 6، صفحة 14
              </li>
              <li>
                <b>٢</b>العملي 3، 18:42
              </li>
            </ul>
          </div>
          <div className={styles.note} data-step="note">
            <span className={styles.noteGlyph}>
              <LandingIcon name="play" />
            </span>
            <p className={styles.noteFrom}>
              د. هالة منصور <span>تركيز امتحاني</span>
            </p>
            <p className={styles.noteText}>
              «شلل إرب بييجي في الامتحان كل سنة تقريبًا.»
            </p>
          </div>
        </div>
        <div className={styles.excerpt} lang="en" dir="ltr" data-step="excerpt">
          <p className={styles.excerptSource}>
            <b>1</b>Lecture 6 handout, page 14
          </p>
          <p className={styles.excerptText}>
            <span className={styles.highlight}>
              Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis
            </span>
            , commonly from excessive separation of the head and shoulder.
          </p>
        </div>
      </div>
      <div className={styles.foot}>
        <p>
          {t(
            "Sample answer from invented lecture notes",
            "إجابة تجريبية من ملاحظات محاضرة مُتخيَّلة",
          )}
        </p>
        <button className={styles.replay} type="button" onClick={replay}>
          <LandingIcon name="replay" width="16" height="16" />
          {t("Replay", "إعادة العرض")}
        </button>
      </div>
    </div>
  );
}
