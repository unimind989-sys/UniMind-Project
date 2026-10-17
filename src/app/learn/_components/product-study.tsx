"use client";
import { useSearchParams } from "next/navigation";
import { resolveChatExchangeSelection } from "@/lib/study/study-origin.application";
import { ProductChat } from "./product-chat";
import { ProductStudio } from "./product-studio";
import { Evidence } from "./study/evidence";
import { Overview } from "./study/overview";
import { Quiz } from "./study/quiz";
import { Report } from "./study/report";
import type { ProductStudyProps } from "./study/study-props";
import { useQuizClock } from "./study/use-quiz-clock";
import { useStudyReturnPath } from "./study/use-study-return-path";

/** One unit's study workspace: routes the current screen to its tool. */
export function ProductStudy(props: ProductStudyProps) {
  const query = useSearchParams();
  const [now, setNow] = useQuizClock(props.scope.unitId);
  useStudyReturnPath(props, now);
  const selection = resolveChatExchangeSelection(query);
  const { screen } = props;
  return (
    <>
      {screen === "overview" ? (
        <Overview {...props} />
      ) : screen === "chat" ? (
        <ProductChat key={props.scope.unitId} {...props} />
      ) : screen === "studio" ? (
        <ProductStudio key={props.scope.unitId} {...props} />
      ) : ["quiz", "attempt", "quiz-review"].includes(screen) ? (
        <Quiz {...props} quizTime={now} onQuizStart={setNow} />
      ) : screen === "sources" || screen === "evidence" ? (
        <Evidence {...props} quizTime={now} />
      ) : (
        <Report
          key={`${props.scope.unitId}:${selection ? `${selection.origin}:${selection.sessionId}:${selection.exchange}` : "unselected"}`}
          {...props}
        />
      )}
    </>
  );
}
