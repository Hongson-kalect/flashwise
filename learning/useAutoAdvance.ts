import { useEffect } from "react";
import { RunState } from "./engine";

const AUTO_NEXT_MS = 650;

/**
 * Câu cụm trả lời đúng ngay (không gợi ý, không làm lại, không "gần đúng") thì tự sang câu kế sau một nhịp ngắn;
 * các trường hợp khác để user đọc kết quả rồi tự bấm Tiếp tục.
 */
export const useAutoAdvance = (state: RunState | null, next: () => void) => {
  const quick =
    !!state && state.phase === "feedback" && !!state.feedback?.correct && state.feedback.verdict !== "close" && state.attempt.tries === 1 && state.attempt.hints === 0;
  useEffect(() => {
    if (!quick) return;
    const t = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [quick, state?.doneSteps]);
};
