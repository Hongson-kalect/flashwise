import { createEmptyCard, fsrs, generatorParameters } from "ts-fsrs";
import { EASY, Grade } from "./types";

/** Cấp thẻ (docs 5.2) và các hằng cùng giá trị với server (flashwise_api/tracking/session.py). */
export const MAX_LEVEL = 7;
export const KNOWN_LEVEL = 5;
export const NEW_LEVEL: Record<Grade, number> = { 1: 0, 2: 1, 3: 1, 4: 2 };
const GLOBAL_WEIGHT = 0.3;
const GLOBAL_PRIOR = 20;
const GLOBAL_MIN_LEARNERS = 5;

/** Lịch FSRS như server: bước học 10 phút rồi `firstReviewHours` giờ (ôn lần đầu cùng ngày), học lại sau `firstReviewHours` giờ. */
/** "Tôi biết từ này" chỉ là lời khai: ôn kiểm tra sau chừng này ngày, lần đó phải nhớ lại thật (khớp server tracking/fsrs.py). */
export const KNOWN_VERIFY_DAYS = 1;

/** Tham số FSRS-6 riêng của user (server tối ưu từ review_log, về máy qua sync như cài đặt `fsrs_params`): 21 số hữu hạn, w20 trong [0,1; 0,8]. */
export const validFsrsParams = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length === 21 &&
  value.every((x) => typeof x === "number" && Number.isFinite(x) && x >= 0) &&
  value[20] >= 0.1 &&
  value[20] <= 0.8;

/** Thẻ "đã biết" chưa qua lần ôn nào: lên cấp 5 chỉ sau 1 lần chấm (học bình thường lần đầu chỉ lên tối đa cấp 2). */
export const isUnverifiedKnown = (level: number, repetitions: number) => repetitions === 1 && level === KNOWN_LEVEL;

/** Các mức mục tiêu nhớ để user chọn: cao hơn = ôn dày hơn nhưng quên ít hơn; 0,85 giảm đáng kể số thẻ phải ôn. */
export const RETENTION_CHOICES = [0.8, 0.85, 0.9, 0.95] as const;

/** Mức kế tiếp trong vòng (giá trị lạ hoặc ở cuối thì về mức đầu). */
export const nextRetention = (current: unknown) => {
  const i = RETENTION_CHOICES.findIndex((r) => typeof current === "number" && Math.abs(r - current) < 0.001);
  return RETENTION_CHOICES[(i + 1) % RETENTION_CHOICES.length];
};

export const makeScheduler = (opts: { retention?: number; firstReviewHours?: number; fuzz?: boolean; params?: number[] | null } = {}) => {
  const hours = `${Math.max(1, Math.round(opts.firstReviewHours ?? 6))}h` as const;
  return fsrs(
    generatorParameters({
      ...(validFsrsParams(opts.params) ? { w: opts.params } : {}),
      request_retention: opts.retention ?? 0.9,
      learning_steps: ["10m", hours],
      relearning_steps: [hours],
      enable_fuzz: opts.fuzz ?? true,
      enable_short_term: true,
    }),
  );
};

/** D0 = (1 - w) · D_phiên + w · D_server, w = 0,3 n / (n + 20); dưới 5 người học thì chỉ dùng D_phiên (docs 5.1). */
export const blendedDifficulty = (sessionDifficulty: number, globalDifficulty: number, learnerCount: number) => {
  if (learnerCount < GLOBAL_MIN_LEARNERS || !globalDifficulty) return sessionDifficulty;
  const w = (GLOBAL_WEIGHT * learnerCount) / (learnerCount + GLOBAL_PRIOR);
  return (1 - w) * sessionDifficulty + w * globalDifficulty;
};

/** Dòng user_sense_progress sau lần chấm đầu của 1 nghĩa mới (cùng cách server tính ở learn/new/complete). */
export interface NewProgress {
  level: number;
  state: number;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  due: Date;
}

export const scheduleNew = (
  scheduler: ReturnType<typeof makeScheduler>,
  grade: Grade,
  at: Date,
  sense: { globalDifficulty: number; learnerCount: number },
  known = false,
): NewProgress => {
  const rating = known ? EASY : grade;
  const { card } = scheduler.next(createEmptyCard(at), at, rating as any);
  // Lời khai "đã biết": ôn kiểm tra sớm (độ bền sau Easy lên tới ~8 ngày), lần đó phải nhớ lại thật
  const due = known ? new Date(Math.min(card.due.getTime(), at.getTime() + KNOWN_VERIFY_DAYS * 86400000)) : card.due;
  return {
    level: known ? KNOWN_LEVEL : NEW_LEVEL[grade],
    state: card.state,
    stability: card.stability,
    difficulty: blendedDifficulty(card.difficulty, sense.globalDifficulty, sense.learnerCount),
    scheduledDays: Math.max(0, (due.getTime() - at.getTime()) / 86400000),
    learningSteps: card.learning_steps ?? 0,
    due,
  };
};

// ---------------------------------------------------------------- ôn tập (thẻ đã học)

export type ReviewMode = "normal" | "quick";
export const QUICK_MAX_LEVEL = 5; // vuốt / đọc chỉ đưa thẻ tới cấp 5, cao hơn phải tự nhớ lại (gõ / nói)
const DEFAULT_W20 = 0.1542; // FSRS-6, như server (tracking/fsrs.py)

/** Khả năng còn nhớ sau `elapsedDays` ngày: R = (1 + f t / S)^-w20, f chọn để R(S) = 0,9. */
export const retrievability = (stability: number, elapsedDays: number, w20 = DEFAULT_W20) => {
  if (!stability || stability <= 0) return 0;
  const factor = Math.pow(0.9, -1 / w20) - 1;
  return Math.pow(1 + (factor * Math.max(elapsedDays, 0)) / stability, -w20);
};

/** Cấp thẻ sau lần ôn (docs 5.2): Quên -2 (tối thiểu 0), Khó giữ, còn lại +1; vuốt không vượt cấp 5. */
export const nextLevel = (level: number, grade: Grade, mode: ReviewMode) => {
  if (grade === 1) return Math.max(0, level - 2);
  if (grade === 2) return level;
  const up = level + 1;
  return Math.min(mode === "quick" ? Math.min(up, Math.max(level, QUICK_MAX_LEVEL)) : up, MAX_LEVEL);
};

/** Tiến độ đã lưu của 1 nghĩa (các cột cần để dựng lại thẻ FSRS). */
export interface StoredProgress {
  level: number;
  state: number;
  stability: number;
  difficulty: number;
  learningSteps: number;
  repetitions: number;
  forgetCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface ReviewProgress {
  level: number;
  state: number;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  due: Date;
  /** Quên một thẻ đang ở trạng thái Review (tính vào forget_count). */
  lapsed: boolean;
}

/** Dòng tiến độ sau 1 lần ôn (cùng luật server ở learn/review/complete). Vuốt (quick) dùng scheduler mục tiêu nhớ cao hơn. */
export const scheduleReview = (
  scheduler: ReturnType<typeof makeScheduler>,
  progress: StoredProgress,
  grade: Grade,
  at: Date,
  mode: ReviewMode,
): ReviewProgress => {
  const state = [1, 2, 3].includes(progress.state) ? progress.state : 1;
  const wasReview = state === 2;
  const card = {
    due: progress.nextReviewAt ?? at,
    stability: progress.stability || 2.3,
    difficulty: progress.difficulty || 5,
    scheduled_days: 0,
    reps: progress.repetitions,
    lapses: progress.forgetCount,
    learning_steps: wasReview ? 0 : progress.learningSteps,
    state,
    last_review: progress.lastReviewedAt ?? undefined,
  };
  const { card: next } = scheduler.next(card as any, at, grade as any);
  return {
    level: nextLevel(progress.level, grade, mode),
    state: next.state,
    stability: next.stability,
    difficulty: next.difficulty,
    scheduledDays: Math.max(0, (next.due.getTime() - at.getTime()) / 86400000),
    learningSteps: next.learning_steps ?? 0,
    due: next.due,
    lapsed: grade === 1 && wasReview,
  };
};
