import { AGAIN, EASY, GOOD, Grade, HARD, StepLog } from "./types";

export const DEFAULT_MEDIAN_MS = 6000;

const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

/**
 * Quy kết quả các bước của 1 thẻ về điểm FSRS (docs 5.8, học mới):
 * - Quên: phải hiện đáp án câu gõ, hoặc phải hiện đáp án ở từ 2 bước.
 * - Khó: có gợi ý, làm lại, gần đúng hoặc phải hiện đáp án 1 bước.
 * - Dễ: mọi bước đúng ngay, không gợi ý, trả lời nhanh hơn thời gian trung vị của chính user.
 * - Vừa: còn lại.
 */
export const autoGrade = (logs: StepLog[], medianMs = DEFAULT_MEDIAN_MS): Grade => {
  if (!logs.length) return GOOD;
  const failed = logs.filter((l) => l.rating === AGAIN);
  if (failed.some((l) => l.kind === "typeWord") || failed.length >= 2) return AGAIN;
  if (failed.length || logs.some((l) => l.rating === HARD || l.hintCount > 0)) return HARD;
  const timed = logs.filter((l) => l.kind !== "copy" && l.durationMs > 0);
  if (timed.length && avg(timed.map((l) => l.durationMs)) <= medianMs) return EASY;
  return GOOD;
};

/** User tự sửa điểm tối đa ±1 nấc so với điểm tự động (docs 5.8). */
export const clampGrade = (auto: Grade, chosen: Grade): Grade => Math.max(auto - 1, Math.min(auto + 1, chosen)) as Grade;

export const GRADE_LABEL: Record<Grade, string> = { 1: "Quên", 2: "Khó", 3: "Vừa", 4: "Dễ" };

/**
 * Điểm của thẻ ôn theo cụm (docs 5.8, học lại): lấy theo BƯỚC ĐẦU (lúc chưa được nhắc lại, đúng là đang đo trí nhớ);
 * các bước sau chỉ hạ điểm khi sai nặng (phải hiện đáp án), không nâng. Dễ khi mọi bước đúng ngay, không gợi ý, nhanh hơn trung vị.
 */
export const autoGradeReview = (logs: StepLog[], medianMs = DEFAULT_MEDIAN_MS): Grade => {
  if (!logs.length) return GOOD;
  const first = logs[0];
  let grade: Grade = first.rating === AGAIN ? AGAIN : first.rating === HARD || first.hintCount > 0 ? HARD : GOOD;
  if (grade === GOOD && logs.every((l) => l.rating === GOOD && l.hintCount === 0)) {
    const timed = logs.filter((l) => l.durationMs > 0);
    if (timed.length && avg(timed.map((l) => l.durationMs)) <= medianMs) grade = EASY;
  }
  if (logs.slice(1).some((l) => l.rating === AGAIN)) grade = Math.min(grade, HARD) as Grade;
  return grade;
};
