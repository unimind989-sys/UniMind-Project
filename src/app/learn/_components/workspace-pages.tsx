import type { Route } from "next";
import Link from "next/link";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";
import type {
  WorkspaceChatSession,
  WorkspaceLocale,
  WorkspaceScope,
} from "@/lib/workspace/workspace.application";

import styles from "../workspace.module.css";

type CommonProps = Readonly<{
  scope: WorkspaceScope;
  locale: WorkspaceLocale;
  basePath: string;
}>;

export function WorkspaceOverview({ scope, locale, basePath }: CommonProps) {
  const text = getWorkspaceCopy(locale);
  const cards = [
    { title: text.chat, body: text.chatDescription, path: "/chat" },
    { title: text.studio, body: text.studioDescription, path: "/studio" },
    { title: text.quiz, body: text.quizDescription, path: "/quiz" },
    { title: text.evidence, body: text.evidenceDescription },
    { title: text.report, body: text.reportDescription },
  ];
  return (
    <>
      <section className={styles.intro}>
        <h2>{text.overviewTitle}</h2>
        <p>{text.overviewBody}</p>
      </section>
      <section aria-labelledby="workspace-tools">
        <h2 id="workspace-tools" className={styles.sectionTitle}>
          {text.continueTitle}
        </h2>
        <div className={styles.toolList}>
          {cards.map((card) => (
            <article className={styles.toolRow} key={card.title}>
              <div>
                <p className={styles.plannedLabel}>{text.placeholder}</p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
              {card.path ? (
                <Link
                  className={styles.openLink}
                  href={`${basePath}${card.path}?lang=${locale}` as Route}
                >
                  {text.open}
                </Link>
              ) : (
                <span className={styles.unavailable}>{text.unavailable}</span>
              )}
            </article>
          ))}
        </div>
      </section>
      <p className={styles.scopeNote}>
        <bdi>{scope.unitTitleEn}</bdi> /{" "}
        <bdi lang="ar">{scope.unitTitleAr}</bdi>
      </p>
    </>
  );
}

export function WorkspaceChat({
  scope,
  locale,
  basePath,
  sessions,
  selectedSession,
  startAction,
}: CommonProps &
  Readonly<{
    sessions: readonly WorkspaceChatSession[];
    selectedSession: WorkspaceChatSession | null;
    startAction: (formData: FormData) => void | Promise<void>;
  }>) {
  const text = getWorkspaceCopy(locale);
  return (
    <section className={styles.featurePanel} aria-labelledby="chat-title">
      <div className={styles.featureHeading}>
        <div>
          <p className={styles.plannedLabel}>{text.placeholder}</p>
          <h2 id="chat-title">{text.chatTitle}</h2>
          <p>{text.chatBody}</p>
        </div>
        <form action={startAction}>
          <input type="hidden" name="cohortId" value={scope.cohortId} />
          <input type="hidden" name="unitId" value={scope.unitId} />
          <input type="hidden" name="locale" value={locale} />
          <button className={styles.primaryAction} type="submit">
            {text.newSession}
          </button>
        </form>
      </div>
      <div className={styles.sessionLayout}>
        <div>
          <h3>{text.chooseSession}</h3>
          {sessions.length === 0 ? (
            <p>{text.noSessions}</p>
          ) : (
            <ul className={styles.sessionList}>
              {sessions.map((session, index) => (
                <li key={session.id}>
                  <Link
                    aria-current={
                      selectedSession?.id === session.id ? "true" : undefined
                    }
                    href={
                      `${basePath}/chat?lang=${locale}&session=${session.id}` as Route
                    }
                  >
                    <span>
                      {locale === "ar"
                        ? `جلسة ${sessions.length - index}`
                        : `Session ${sessions.length - index}`}
                    </span>
                    <time dateTime={session.createdAt}>
                      {new Intl.DateTimeFormat(
                        locale === "ar" ? "ar-EG" : "en-GB",
                        { dateStyle: "medium", timeStyle: "short" },
                      ).format(new Date(session.createdAt))}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.mockComposer}>
          <p className={styles.selectedSession}>
            {text.selectedSession}:{" "}
            <strong>
              {selectedSession === null ? "—" : selectedSession.id.slice(0, 8)}
            </strong>
          </p>
          <label htmlFor="mock-message">{text.messagePlaceholder}</label>
          <textarea
            id="mock-message"
            disabled
            placeholder={text.messagePlaceholder}
          />
          <button type="button" disabled>
            {text.unavailable}
          </button>
        </div>
      </div>
    </section>
  );
}

export function WorkspacePlaceholder({
  locale,
  kind,
}: Readonly<{ locale: WorkspaceLocale; kind: "studio" | "quiz" }>) {
  const text = getWorkspaceCopy(locale);
  const title = kind === "studio" ? text.studioTitle : text.quizTitle;
  const body = kind === "studio" ? text.studioBody : text.quizBody;
  return (
    <section className={styles.emptyFeature}>
      <p className={styles.plannedLabel}>{text.placeholder}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      <button type="button" disabled>
        {text.unavailable}
      </button>
    </section>
  );
}
