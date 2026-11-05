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
export const makeScheduler = (opts: { retention?: number; firstReviewHours?: number; fuzz?: boolean } = {}) => {
  const hours = `${Math.max(1, Math.round(opts.firstReviewHours ?? 6))}h` as const;
  return fsrs(
    generatorParameters({
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
  return {
    level: known ? KNOWN_LEVEL : NEW_LEVEL[grade],
    state: card.state,
    stability: card.stability,
    difficulty: blendedDifficulty(card.difficulty, sense.globalDifficulty, sense.learnerCount),
    scheduledDays: Math.max(0, (card.due.getTime() - at.getTime()) / 86400000),
    learningSteps: card.learning_steps ?? 0,
    due: card.due,
  };
};
