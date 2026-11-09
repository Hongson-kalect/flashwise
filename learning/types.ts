/** Điểm chấm FSRS: 1 Quên (Again), 2 Khó (Hard), 3 Vừa (Good), 4 Dễ (Easy). */
export type Grade = 1 | 2 | 3 | 4;
export const AGAIN: Grade = 1;
export const HARD: Grade = 2;
export const GOOD: Grade = 3;
export const EASY: Grade = 4;

/** Các kiểu bước của phiên học cụm (docs/learning-design.md 3.1). Thêm kiểu mới = thêm vào registry ở steps.ts + UI ở components/learning. */
export type StepKind = "copy" | "chooseMeaning" | "chooseWord" | "typeWord" | "listenChoose" | "dictation" | "speak" | "handwrite" | "swipe";
/** Bước của phiên theo cụm (khác vuốt, vuốt có reducer riêng ở swipe.ts). */
export type ClusterStepKind = Exclude<StepKind, "swipe">;

/** Dữ liệu 1 thẻ (1 nghĩa) đã gộp từ SQLite: contents + delta, đúng ngôn ngữ của từ / của người học. */
export interface LearnCard {
  /** original_sense_id: khoá tiến độ và khoá trong phiên. */
  key: string;
  itemId: string | null;
  senseId: string;
  wordId: string;
  word: string;
  lang: string;
  pos: string | null;
  /** Mức của nghĩa (CEFR / JLPT / TOPIK / HSK), dùng để thống kê "đã biết" theo mức. */
  level?: string | null;
  ipa: string;
  audio: string | null;
  imageUri: string | null;
  keywords: string[];
  /** Định nghĩa bằng ngôn ngữ của từ / bằng tiếng mẹ đẻ. */
  definition: string;
  definitionNative: string;
  /** Nghĩa ngắn bằng tiếng mẹ đẻ (danh sách bản dịch). */
  translations: string[];
  /** `roman`: phiên âm Latin của câu ví dụ (chỉ ja / zh / ko). */
  example: { text: string; native: string; roman?: string } | null;
  globalDifficulty: number;
  learnerCount: number;
}

/** Nghĩa ngắn để hiện / làm đáp án: bản dịch, không có thì định nghĩa tiếng mẹ đẻ, rồi định nghĩa gốc. */
export const glossOf = (card: LearnCard) =>
  card.translations.slice(0, 3).join(", ") || card.definitionNative || card.definition;

export interface ChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

/** 1 câu hỏi của 1 bước. UI chọn cách vẽ theo `kind`, ô trả lời theo `answerType`. */
export interface Question {
  kind: ClusterStepKind;
  cardKey: string;
  /** type = gõ, choose = chọn đáp án, speak = nói vào micro (nhận dạng trên máy), draw = viết tay từng ký tự. */
  answerType: "type" | "choose" | "speak" | "draw";
  /** Đáp án chuẩn (để so khi gõ, để hiện khi sai). */
  answer: string;
  options: ChoiceOption[];
}

/** Một lần chấm 1 bước (ghi review_log với is_fsrs = 0). rating: 3 đúng ngay, 2 có gợi ý / làm lại / gần đúng, 1 phải hiện đáp án. */
export interface StepLog {
  kind: StepKind;
  rating: Grade;
  correct: boolean;
  hintCount: number;
  attempts: number;
  durationMs: number;
  at: number;
}

export type Verdict = "exact" | "close" | "wrong";
