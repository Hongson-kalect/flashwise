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
  /** Bước nghe: không tiện nghe thì các bước nghe còn lại đổi sang dạng chọn / gõ. */
  onSkipListen: () => void;
}

/** Phần trả lời (nửa dưới): theo `answerType` của câu hỏi (chọn / gõ). */
export interface AnswerProps {
  card: LearnCard;
  question: Question;
  attempt: Attempt;
  feedback: Feedback | null;
  onAnswer: (value: string) => void;
  onHint: () => void;
  /** Kết quả nhận dạng giọng nói (phương án tốt nhất trước) cho bước nói. */
  onSpeech: (transcripts: string[]) => void;
  /** Không nói được lúc này: bỏ các bước nói còn lại của phiên. */
  onSkipSpeak: () => void;
  /** Bài viết tay: phương án nhận dạng (tốt nhất trước) của từng ô ký tự. */
  onWritten: (cells: string[][]) => void;
  /** Không viết được lúc này: bỏ các bước viết tay còn lại của phiên. */
  onSkipWrite: () => void;
}
