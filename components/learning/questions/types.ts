import { Attempt, Feedback } from "@/learning/engine";
import { LearnCard, Question } from "@/learning/types";

/** Phần đề (nửa trên): mỗi kiểu bước một component, đăng ký ở prompts.tsx. */
export interface PromptProps {
  card: LearnCard;
  question: Question;
  attempt: Attempt;
  /** Cài đặt `hearable`: được tự đọc từ khi hiện. */
  hearable: boolean;
  /** Chỉ bước copy có: bấm "Đã biết" để bỏ cả thẻ. */
  onKnown: () => void;
}

/** Phần trả lời (nửa dưới): theo `answerType` của câu hỏi (chọn / gõ). */
export interface AnswerProps {
  card: LearnCard;
  question: Question;
  attempt: Attempt;
  feedback: Feedback | null;
  onAnswer: (value: string) => void;
  onHint: () => void;
}
