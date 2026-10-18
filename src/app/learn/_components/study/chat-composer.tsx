"use client";
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { useProductText } from "@/app/_components/product-copy";
import { FrontendIcon } from "@/app/_components/frontend-system";
import { Button } from "@/app/_components/product-ui";
import type { Locale } from "@/lib/i18n/locale";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import styles from "../product-chat.module.css";

export type AnswerLanguage = "en" | "ar" | "mixed";
const maxFieldHeight = 140;

/** True while the primary pointer is fine (a mouse or trackpad). */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setFine(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * The docked composer (DESIGN.md "Composer"): one round field that grows
 * with its text, the answer-language menu, the Send button (an icon on
 * phones, named "Send") and the privacy line under it. Enter sends only with
 * a fine pointer; touch keyboards add a line and send with the button.
 */
export function ChatComposer({
  locale,
  scope,
  input,
  message,
  language,
  answering,
  sending,
  sharing,
  onMessage,
  onLanguage,
  onSend,
  onCancel,
}: {
  locale: Locale;
  scope: WorkspaceScope;
  input: Ref<HTMLTextAreaElement | null>;
  message: string;
  language: AnswerLanguage;
  answering: boolean;
  sending: boolean;
  sharing: "shared" | "private" | undefined;
  onMessage: (message: string) => void;
  onLanguage: (language: AnswerLanguage) => void;
  onSend: () => void;
  onCancel: () => void;
}) {
  const t = useProductText(locale);
  const fine = useFinePointer();
  const field = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(input, () => field.current as HTMLTextAreaElement, []);
  // `field-sizing: content` grows the field where supported; elsewhere the
  // height follows the text here, up to the same cap.
  useLayoutEffect(() => {
    const element = field.current;
    if (!element || CSS.supports("field-sizing", "content")) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, maxFieldHeight)}px`;
  }, [message]);
  return (
    <div className={styles.dock} data-workspace-chrome>
      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <label htmlFor="message" className="visually-hidden">
          {t("Message", "السؤال")}
        </label>
        <textarea
          ref={field}
          id="message"
          name="message"
          dir="auto"
          rows={1}
          maxLength={1000}
          autoComplete="off"
          enterKeyHint={fine ? "send" : "enter"}
          aria-describedby="composer-meta"
          placeholder={t(
            `Ask about this ${scope.unitLabelSingularEn.toLowerCase()}…`,
            `اسأل عن ${scope.unitLabelSingularAr}…`,
          )}
          value={message}
          onChange={(event) => onMessage(event.target.value)}
          readOnly={sending}
          disabled={!answering}
          onKeyDown={(event) => {
            if (
              event.key !== "Enter" ||
              event.shiftKey ||
              event.nativeEvent.isComposing ||
              !window.matchMedia("(pointer: fine)").matches
            )
              return;
            event.preventDefault();
            onSend();
          }}
        />
        <label className={styles.languagePill}>
          <FrontendIcon name="globe" size={16} />
          <span className="visually-hidden">
            {t("Answer language", "لغة الإجابة")}
          </span>
          <select
            name="answer-language"
            value={language}
            disabled={sending || !answering}
            onChange={(event) =>
              onLanguage(event.target.value as AnswerLanguage)
            }
          >
            <option value="en">{t("English", "الإنجليزية")}</option>
            <option value="ar">{t("Arabic", "العربية")}</option>
            <option value="mixed">{t("Mixed", "مختلط")}</option>
          </select>
        </label>
        {sending ? (
          <Button key="cancel" className={styles.cancel} onClick={onCancel}>
            {t("Cancel stream", "إلغاء البث")}
          </Button>
        ) : (
          <Button
            key="send"
            variant="primary"
            type="submit"
            className={styles.send}
            disabled={!answering || !message.trim()}
          >
            <FrontendIcon name="send" />
            <span className={styles.sendLabel}>{t("Send", "إرسال")}</span>
          </Button>
        )}
      </form>
      <p id="composer-meta" className={styles.composerMeta}>
        {answering ? (
          <>
            <strong>
              {sharing === "private"
                ? t("Private for future exchanges", "المحادثات القادمة خاصة")
                : t("Visible to UniMind’s founders", "ظاهرة لمؤسسي UniMind")}
            </strong>
            {/* Keyboard advice for fine pointers only (CSS). */}
            <span className={styles.enterHint}>
              {t(
                "Enter to send; Shift+Enter for a new line",
                "Enter للإرسال؛ Shift+Enter لسطر جديد",
              )}
            </span>
          </>
        ) : (
          <strong>
            {t("Answers are not available yet", "الإجابات غير متاحة بعد")}
          </strong>
        )}
      </p>
    </div>
  );
}
